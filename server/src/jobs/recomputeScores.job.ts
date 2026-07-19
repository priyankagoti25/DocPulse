import cron from "node-cron";
import { Repository } from "../models/Repository.model";
import { recomputeRepositoryScore } from "../modules/repositories/repository.service";
import { emitRepoScoreUpdated } from "../websocket/socketServer";

export async function runNightlyRecompute(): Promise<void> {
  console.log("[cron] Starting nightly staleness recompute...");

  const repos = await Repository.find({}, "_id currentScore status");
  let updatedCount = 0;

  for (const repo of repos) {
    const previousScore = repo.currentScore;
    const updated = await recomputeRepositoryScore(repo._id.toString());

    if (updated && updated.currentScore !== previousScore) {
      updatedCount += 1;
      emitRepoScoreUpdated(updated._id.toString(), {
        newScore: updated.currentScore,
        newStatus: updated.status,
      });
    }
  }

  console.log(
    `[cron] Nightly recompute done. ${updatedCount}/${repos.length} repos changed.`,
  );
}

export function scheduleNightlyRecompute(): void {
  cron.schedule("0 2 * * *", () => {
    runNightlyRecompute().catch((err) => {
      console.error("[cron] Nightly recompute failed", err);
    });
  });

  console.log(
    "[cron] Nightly staleness recompute scheduled for 2:00 AM daily.",
  );
}
