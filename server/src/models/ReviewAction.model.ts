import { Schema, model, Types } from "mongoose";

export interface IReviewAction {
  _id: Types.ObjectId;
  repositoryId: Types.ObjectId;
  userId: Types.ObjectId;
  action: "confirmed" | "flagged_outdated";
  atCommitSha: string | null;
  note: string | null;
  createdAt: Date;
}

const reviewActionSchema = new Schema<IReviewAction>(
  {
    repositoryId: {
      type: Schema.Types.ObjectId,
      ref: "Repository",
      required: true,
    },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    action: {
      type: String,
      enum: ["confirmed", "flagged_outdated"],
      required: true,
    },
    atCommitSha: { type: String, default: null },
    note: { type: String, default: null },
  },
  { timestamps: true },
);

export const ReviewAction = model<IReviewAction>(
  "ReviewAction",
  reviewActionSchema,
);
