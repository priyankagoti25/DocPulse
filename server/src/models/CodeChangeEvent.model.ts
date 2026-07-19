import { Schema, model, Types } from "mongoose";

export interface ICodeChangeEvent {
  _id: Types.ObjectId;
  repositoryId: Types.ObjectId;
  commitSha: string;
  filesChanged: string[];
  linesChanged: number;
  pushedAt: Date;
  createdAt: Date;
}

const codeChangeEventSchema = new Schema<ICodeChangeEvent>(
  {
    repositoryId: {
      type: Schema.Types.ObjectId,
      ref: "Repository",
      required: true,
    },
    commitSha: { type: String, required: true },
    filesChanged: { type: [String], default: [] },
    linesChanged: { type: Number, default: 0 },
    pushedAt: { type: Date, required: true },
  },
  { timestamps: true },
);

export const CodeChangeEvent = model<ICodeChangeEvent>(
  "CodeChangeEvent",
  codeChangeEventSchema,
);
