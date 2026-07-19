import { Schema, model, Types } from 'mongoose';

export interface ITeam {
  _id: Types.ObjectId;
  name: string;
  ownerId: Types.ObjectId;
  members: Types.ObjectId[];
  githubOrgId: number | null;
  createdAt: Date;
  updatedAt: Date;
}

const teamSchema = new Schema<ITeam>(
  {
    name: { type: String, required: true },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{ type: Schema.Types.ObjectId, ref: 'User', default: [] }],
    githubOrgId: { type: Number, default: null, unique: true, sparse: true },
  },
  { timestamps: true }
);

export const Team = model<ITeam>('Team', teamSchema);
