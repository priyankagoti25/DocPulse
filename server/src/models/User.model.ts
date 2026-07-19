import { Schema, model, Types } from "mongoose";
import { encrypt } from "../utils/crypto";

export interface IUser {
  _id: Types.ObjectId;
  githubId: number;
  username: string;
  email: string | null;
  avatarUrl: string | null;
  accessToken: string;
  teams: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    githubId: { type: Number, required: true, unique: true },
    username: { type: String, required: true },
    email: { type: String, default: null },
    avatarUrl: { type: String, default: null },
    accessToken: { type: String, required: true, select: false },
    teams: [{ type: Schema.Types.ObjectId, ref: "Team", default: [] }],
  },
  { timestamps: true },
);

userSchema.pre("save", function () {
  if (this.isModified("accessToken")) {
    this.accessToken = encrypt(this.accessToken);
  }
});

export const User = model<IUser>("User", userSchema);
