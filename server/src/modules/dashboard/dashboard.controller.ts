import { Response } from "express";
import { AuthenticatedRequest } from "../../middleware/auth.middleware.js";
import { Repository } from "../../models/Repository.model.js";
import { runNightlyRecompute } from "../../jobs/recomputeScores.job.js";

export async function getDashboardSummary(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  const repos = await Repository.find({ ownerId: req.userId });

  const statusCounts = { fresh: 0, aging: 0, stale: 0, critical: 0 };
  let totalScore = 0;

  for (const repo of repos) {
    statusCounts[repo.status] += 1;
    totalScore += repo.currentScore;
  }

  const averageScore =
    repos.length > 0 ? Math.round(totalScore / repos.length) : 100;

  res.json({
    totalRepos: repos.length,
    averageScore,
    statusCounts,
  });
}

export async function postManualRecompute(
  _req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  await runNightlyRecompute();
  res.json({ message: "Recompute complete" });
}
