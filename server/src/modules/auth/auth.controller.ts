import { Request, Response } from "express";
import crypto from "crypto";
import { env } from "../../config/env";
import {
  exchangeCodeForToken,
  fetchGithubProfile,
  upsertUserFromGithub,
} from "./auth.service";
import { signAccessToken } from "../../utils/jwt";
import { AuthenticatedRequest } from "../../middleware/auth.middleware";
import { User } from "../../models/User.model";

export function redirectToGithub(req: Request, res: Response): void {
  console.log("in api");
  const state = crypto.randomBytes(16).toString("hex");

  res.cookie("oauth_state", state, { httpOnly: true, maxAge: 5 * 60 * 1000 });

  const params = new URLSearchParams({
    client_id: env.GITHUB_CLIENT_ID,
    redirect_uri: env.GITHUB_CALLBACK_URL,
    // repo + admin:repo_hook: needed later to list private repos and create webhooks
    scope: "read:user user:email repo admin:repo_hook",
    state,
  });

  res.redirect(`https://github.com/login/oauth/authorize?${params.toString()}`);
}

export async function handleGithubCallback(
  req: Request,
  res: Response,
): Promise<void> {
  const { code, state } = req.query;
  const storedState = req.cookies?.oauth_state;

  if (!code || typeof code !== "string") {
    res.status(400).json({ message: "Missing authorization code" });
    return;
  }

  if (!state || state !== storedState) {
    res.status(400).json({ message: "Invalid state — possible CSRF attempt" });
    return;
  }

  res.clearCookie("oauth_state");

  try {
    const accessToken = await exchangeCodeForToken(code);
    const profile = await fetchGithubProfile(accessToken);
    const user = await upsertUserFromGithub(profile, accessToken);

    const jwtToken = signAccessToken({ userId: user._id.toString() });

    res.cookie("token", jwtToken, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.redirect(`${env.CLIENT_URL}/dashboard`);
  } catch (err) {
    console.error("[auth] GitHub callback failed", err);
    res.redirect(`${env.CLIENT_URL}/login?error=github_auth_failed`);
  }
}

export async function getCurrentUser(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  const user = await User.findById(req.userId);

  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  res.json({
    id: user._id,
    username: user.username,
    email: user.email,
    avatarUrl: user.avatarUrl,
  });
}

export function logout(_req: Request, res: Response): void {
  res.clearCookie("token");
  res.json({ message: "Logged out" });
}
