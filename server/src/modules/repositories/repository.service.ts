import { env } from "../../config/env.js";
import { Repository, IRepository } from "../../models/Repository.model.js";
import { ReviewAction } from "../../models/ReviewAction.model.js";
import { CodeChangeEvent } from "../../models/CodeChangeEvent.model.js";
import { User } from "../../models/User.model.js";
import { getOctokitForUser } from "../../utils/githubClient.js";
import {
  computeStalenessScore,
  scoreToStatus,
  daysBetween,
} from "../staleness/scoreEngine.js";
import { Types } from "mongoose";

export interface AvailableRepo {
  githubRepoId: number;
  fullName: string;
  defaultBranch: string;
  private: boolean;
}

export async function listAvailableRepos(
  userId: string,
): Promise<AvailableRepo[]> {
  const user = await User.findById(userId).select("+accessToken");
  if (!user) throw new Error("User not found");

  const octokit = getOctokitForUser(user);
  const { data } = await octokit.request("GET /user/repos", {
    per_page: 100,
    sort: "updated",
  });

  return data.map((repo) => ({
    githubRepoId: repo.id,
    fullName: repo.full_name,
    defaultBranch: repo.default_branch ?? "main",
    private: repo.private,
  }));
}

export async function connectRepository(
  userId: string,
  fullName: string,
): Promise<IRepository> {
  const user = await User.findById(userId).select("+accessToken");
  if (!user) throw new Error("User not found");

  const [owner, repo] = fullName.split("/");
  if (!owner || !repo) throw new Error("Invalid repository full name");

  const octokit = getOctokitForUser(user);
  const { data: repoData } = await octokit.request(
    "GET /repos/{owner}/{repo}",
    { owner, repo },
  );

  let repository = await Repository.findOne({ githubRepoId: repoData.id });
  const isReconnect = !!repository;

  if (!repository) {
    // Genuinely new repo — start with clean defaults.
    repository = new Repository({
      githubRepoId: repoData.id,
      fullName: repoData.full_name,
      ownerId: user._id,
      defaultBranch: repoData.default_branch,
      isConnected: true,
      lastReviewedAt: new Date(),
      currentScore: 100,
      status: "fresh",
    });
  } else {
    // Reconnecting a previously-disconnected repo — reuse the same
    // document deliberately. Score, accumulated counters, and history
    // (CodeChangeEvent/ReviewAction) are preserved on purpose: disconnect
    // is not meant to be a way to reset a low score back to 100.
    repository.isConnected = true;
    repository.ownerId = user._id;
    repository.defaultBranch = repoData.default_branch;
  }

  // Create the webhook and store its id so we can properly delete it later.
  // Skip creation on reconnect if we already have a hookId recorded — it's
  // likely still registered on GitHub from before.
  if (!isReconnect || !repository.hookId) {
    try {
      const { data: hook } = await octokit.request(
        "POST /repos/{owner}/{repo}/hooks",
        {
          owner,
          repo,
          name: "web",
          active: true,
          events: ["push"],
          config: {
            url: `${env.SERVER_BASE_URL}/api/webhooks/github`,
            content_type: "json",
            secret: env.GITHUB_WEBHOOK_SECRET,
          },
        },
      );
      repository.hookId = hook.id;
    } catch (err: any) {
      if (err?.status !== 422) {
        console.error("[repository] webhook creation failed", err);
      }
    }
  }

  await repository.save();
  return repository;
}

export async function listRepositoriesForUser(userId: string) {
  return Repository.find({
    ownerId: new Types.ObjectId(userId),
    isConnected: true,
  }).sort({
    createdAt: -1,
  });
}

export async function getRepositoryDetail(repositoryId: string) {
  const repository = await Repository.findById(repositoryId);
  if (!repository) throw new Error("Repository not found");

  const changeEvents = await CodeChangeEvent.find({ repositoryId })
    .sort({ pushedAt: -1 })
    .limit(20);
  const reviewHistory = await ReviewAction.find({ repositoryId })
    .sort({ createdAt: -1 })
    .limit(20);

  return { repository, changeEvents, reviewHistory };
}

export async function submitRepositoryReview(
  repositoryId: string,
  userId: string,
  action: "confirmed" | "flagged_outdated",
  note: string | null,
) {
  const repository = await Repository.findById(repositoryId);
  if (!repository) throw new Error("Repository not found");

  await ReviewAction.create({
    repositoryId: repository._id,
    userId,
    action,
    atCommitSha: repository.lastReviewedSha,
    note,
  });

  if (action === "confirmed") {
    repository.lastReviewedAt = new Date();
    repository.accumulatedChangedFiles = 0;
    repository.accumulatedChangedLines = 0;
    repository.currentScore = 100;
    repository.status = "fresh";
  } else {
    repository.currentScore = 10;
    repository.status = "critical";
  }

  await repository.save();
  return repository;
}

/**
 * Recomputes a single repository's score from its current accumulated
 * counters and time-since-review. Used by both the webhook handler and
 * the nightly cron.
 */
export async function recomputeRepositoryScore(repositoryId: string) {
  const repository = await Repository.findById(repositoryId);
  if (!repository) return null;

  const daysSinceLastReview = repository.lastReviewedAt
    ? daysBetween(repository.lastReviewedAt, new Date())
    : 0;

  const score = computeStalenessScore({
    daysSinceLastReview,
    changedFilesCount: repository.accumulatedChangedFiles,
    changedLinesCount: repository.accumulatedChangedLines,
  });

  repository.currentScore = score;
  repository.status = scoreToStatus(score);
  await repository.save();

  return repository;
}

export async function deleteRepository(
  userId: string,
  repositoryId: string,
): Promise<void> {
  const repository = await Repository.findOne({
    _id: repositoryId,
    ownerId: userId,
  });
  if (!repository) throw new Error("Repository not found or not owned by user");

  // Actually remove the webhook from GitHub — without this, GitHub keeps
  // sending push events to a server that's discarding them silently.
  if (repository.hookId) {
    try {
      const user = await User.findById(userId).select("+accessToken");
      if (user) {
        const octokit = getOctokitForUser(user);
        const [owner, repo] = repository.fullName.split("/");
        await octokit.request("DELETE /repos/{owner}/{repo}/hooks/{hook_id}", {
          owner: owner ?? "",
          repo: repo ?? "",
          hook_id: repository.hookId,
        });
      }
    } catch (err: any) {
      // 404 means it's already gone on GitHub's side — fine to ignore.
      if (err?.status !== 404) {
        console.error("[repository] failed to delete webhook on GitHub", err);
      }
    }
  }

  // Soft delete only — score, accumulated counters, and full history
  // (CodeChangeEvent/ReviewAction) are preserved. Reconnecting later
  // reuses this same document rather than starting fresh at 100.
  repository.isConnected = false;
  repository.hookId = null;
  await repository.save();
}
