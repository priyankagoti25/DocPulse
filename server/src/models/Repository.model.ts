import { Schema, model, Types } from "mongoose";

export interface IRepository {
  _id: Types.ObjectId;
  githubRepoId: number;
  fullName: string;
  ownerId: Types.ObjectId;
  defaultBranch: string;
  isConnected: boolean;
  hookId: number | null;
  lastReviewedAt: Date | null;
  lastReviewedSha: string | null;
  accumulatedChangedFiles: number;
  accumulatedChangedLines: number;
  currentScore: number;
  status: "fresh" | "aging" | "stale" | "critical";
  createdAt: Date;
  updatedAt: Date;
}

const repositorySchema = new Schema<IRepository>(
  {
    githubRepoId: { type: Number, required: true, unique: true },
    fullName: { type: String, required: true },
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    defaultBranch: { type: String, required: true },
    isConnected: { type: Boolean, default: true },
    hookId: { type: Number, default: null },
    lastReviewedAt: { type: Date, default: () => new Date() },
    lastReviewedSha: { type: String, default: null },
    accumulatedChangedFiles: { type: Number, default: 0 },
    accumulatedChangedLines: { type: Number, default: 0 },
    currentScore: { type: Number, default: 100 },
    status: {
      type: String,
      enum: ["fresh", "aging", "stale", "critical"],
      default: "fresh",
    },
  },
  { timestamps: true },
);

export const Repository = model<IRepository>("Repository", repositorySchema);
