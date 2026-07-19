import { Octokit } from "octokit";
import { decrypt } from "./crypto.js";
import { IUser } from "../models/User.model.js";

/**
 * Builds an Octokit client authenticated as the given user, using their
 * decrypted OAuth access token. `user` must have been fetched with
 * .select('+accessToken') since the field is select:false by default.
 */
export function getOctokitForUser(user: Pick<IUser, "accessToken">): Octokit {
  const token = decrypt(user.accessToken);
  return new Octokit({ auth: token });
}
