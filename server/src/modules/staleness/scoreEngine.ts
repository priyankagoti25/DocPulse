export interface ScoreInput {
  daysSinceLastReview: number;
  changedFilesCount: number;
  changedLinesCount: number;
}

export type DocStatus = 'fresh' | 'aging' | 'stale' | 'critical';

export function computeStalenessScore(input: ScoreInput): number {
  const penalty =
    input.daysSinceLastReview * 0.5 +
    input.changedFilesCount * 4 +
    input.changedLinesCount * 0.05;

  return Math.round(Math.max(0, 100 - Math.min(100, penalty)));
}

export function scoreToStatus(score: number): DocStatus {
  if (score >= 85) return 'fresh';
  if (score >= 60) return 'aging';
  if (score >= 30) return 'stale';
  return 'critical';
}

export function daysBetween(from: Date, to: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.max(0, (to.getTime() - from.getTime()) / msPerDay);
}
