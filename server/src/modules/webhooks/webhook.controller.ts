import { Request, Response } from "express";
import crypto from "crypto";
import { env } from "../../config/env";
import { Repository } from "../../models/Repository.model";
import { CodeChangeEvent } from "../../models/CodeChangeEvent.model";
import { User } from "../../models/User.model";
import { getOctokitForUser } from "../../utils/githubClient";
import { recomputeRepositoryScore } from "../repositories/repository.service";
import { emitRepoScoreUpdated } from "../../websocket/socketServer";

interface RawBodyRequest extends Request {
  rawBody?: Buffer;
}

function verifySignature(req: RawBodyRequest): boolean {
  const signature = req.headers["x-hub-signature-256"] as string | undefined;
  if (!signature || !req.rawBody) return false;

  const expected =
    "sha256=" +
    crypto
      .createHmac("sha256", env.GITHUB_WEBHOOK_SECRET)
      .update(req.rawBody)
      .digest("hex");

  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expected),
    );
  } catch {
    return false;
  }
}

export async function handleGithubWebhook(
  req: RawBodyRequest,
  res: Response,
): Promise<void> {
  const event = req.headers["x-github-event"];

  if (!verifySignature(req)) {
    res.status(401).json({ message: "Invalid webhook signature" });
    return;
  }

  if (event !== "push") {
    res.status(202).json({ message: "Event ignored" });
    return;
  }

  res.status(202).json({ message: "Accepted" });

  try {
    await processPushEvent(req.body);
  } catch (err) {
    console.error("[webhook] failed to process push event", err);
  }
}

async function processPushEvent(payload: any): Promise<void> {
  const githubRepoId = payload.repository?.id;
  console.log(`[webhook] push received for githubRepoId=${githubRepoId}`);
  if (!githubRepoId) return;

  const repository = await Repository.findOne({ githubRepoId });
  if (!repository) {
    console.log(
      `[webhook] no matching Repository found for githubRepoId=${githubRepoId} — ignoring`,
    );
    return;
  }
  console.log(
    `[webhook] matched repository ${repository.fullName} (_id=${repository._id})`,
  );
  const pushedBranch = (payload.ref as string | undefined)?.replace(
    "refs/heads/",
    "",
  );
  if (pushedBranch !== repository.defaultBranch) {
    console.log(
      `[webhook] push was to branch "${pushedBranch}", not default branch "${repository.defaultBranch}" — ignoring`,
    );
    return;
  }
  const commits: any[] = payload.commits ?? [];
  const changedFiles = new Set<string>();
  for (const commit of commits) {
    for (const f of commit.added ?? []) changedFiles.add(f);
    for (const f of commit.removed ?? []) changedFiles.add(f);
    for (const f of commit.modified ?? []) changedFiles.add(f);
  }

  if (changedFiles.size === 0) {
    console.log("[webhook] push had no file changes — ignoring");
    return;
  }

  // Approximate line-change magnitude using the head commit's stats only
  // (a known simplification — see README for detail).
  let linesChanged = 0;
  const headSha = payload.head_commit?.id;
  if (headSha) {
    try {
      const owner = await User.findById(repository.ownerId).select(
        "+accessToken",
      );
      if (owner) {
        const octokit = getOctokitForUser(owner);
        const [ownerName, repoName] = repository.fullName.split("/");
        const { data: commitData } = await octokit.request(
          "GET /repos/{owner}/{repo}/commits/{ref}",
          { owner: ownerName, repo: repoName, ref: headSha },
        );
        linesChanged = commitData.stats?.total ?? 0;
      }
    } catch (err) {
      console.error("[webhook] failed to fetch commit stats", err);
    }
  }

  const changedFilesArray = Array.from(changedFiles);

  await CodeChangeEvent.create({
    repositoryId: repository._id,
    commitSha: headSha ?? "unknown",
    filesChanged: changedFilesArray,
    linesChanged,
    pushedAt: new Date(),
  });

  repository.accumulatedChangedFiles += changedFilesArray.length;
  repository.accumulatedChangedLines += linesChanged;
  await repository.save();

  const updated = await recomputeRepositoryScore(repository._id.toString());
  if (updated) {
    console.log(
      `[socket] emitting for repo ${updated._id} — newScore=${updated.currentScore} newStatus=${updated.status}`,
    );
    emitRepoScoreUpdated(updated._id.toString(), {
      newScore: updated.currentScore,
      newStatus: updated.status,
    });
  }
}
