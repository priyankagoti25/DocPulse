import axios from "axios";
import { env } from "../../config/env.js";
import { User } from "../../models/User.model.js";

interface GithubTokenResponse {
  access_token: string;
  scope: string;
  token_type: string;
}

interface GithubProfile {
  id: number;
  login: string;
  email: string | null;
  avatar_url: string;
}

export async function exchangeCodeForToken(code: string): Promise<string> {
  const response = await axios.post<GithubTokenResponse>(
    "https://github.com/login/oauth/access_token",
    {
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: env.GITHUB_CALLBACK_URL,
    },
    { headers: { Accept: "application/json" } },
  );

  if (!response.data.access_token) {
    throw new Error("GitHub did not return an access token");
  }

  return response.data.access_token;
}

export async function fetchGithubProfile(
  accessToken: string,
): Promise<GithubProfile> {
  const { data } = await axios.get<GithubProfile>(
    "https://api.github.com/user",
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  );

  if (!data.email) {
    const { data: emails } = await axios.get<
      { email: string; primary: boolean }[]
    >("https://api.github.com/user/emails", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const primary = emails.find((e) => e.primary);
    data.email = primary?.email ?? null;
  }

  return data;
}

export async function upsertUserFromGithub(
  profile: GithubProfile,
  accessToken: string,
) {
  let user = await User.findOne({ githubId: profile.id });

  if (!user) {
    user = new User({
      githubId: profile.id,
      username: profile.login,
      email: profile.email,
      avatarUrl: profile.avatar_url,
      accessToken,
    });
  } else {
    user.username = profile.login;
    user.email = profile.email;
    user.avatarUrl = profile.avatar_url;
    user.accessToken = accessToken; // triggers the pre-save encryption hook
  }

  await user.save();
  return user;
}
