import { apiClient } from "../../shared/lib/apiClient";
import type { User } from "./store/authStore";

export function redirectToGithubLogin(): void {
  // http://localhost:5000/api/auth/github
  window.location.href = `${import.meta.env.VITE_API_URL}/auth/github`;
}

export async function fetchCurrentUser(): Promise<User> {
  const { data } = await apiClient.get<User>("/auth/me");
  return data;
}

export async function logout(): Promise<void> {
  await apiClient.post("/auth/logout");
}
