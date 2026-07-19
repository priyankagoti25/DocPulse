import { apiClient } from "../../shared/lib/apiClient";

export interface AvailableRepo {
  githubRepoId: number;
  fullName: string;
  defaultBranch: string;
  private: boolean;
}

export interface ConnectedRepo {
  _id: string;
  fullName: string;
  lastReviewedAt: string | null;
  currentScore: number;
  status: "fresh" | "aging" | "stale" | "critical";
  createdAt: string;
}

export interface CodeChangeEvent {
  _id: string;
  commitSha: string;
  filesChanged: string[];
  linesChanged: number;
  pushedAt: string;
}

export interface ReviewAction {
  _id: string;
  action: "confirmed" | "flagged_outdated";
  note: string | null;
  createdAt: string;
}

export interface RepositoryDetail {
  repository: ConnectedRepo;
  changeEvents: CodeChangeEvent[];
  reviewHistory: ReviewAction[];
}

export async function fetchAvailableRepos(): Promise<AvailableRepo[]> {
  const { data } = await apiClient.get<AvailableRepo[]>(
    "/repositories/available",
  );
  return data;
}

export async function fetchConnectedRepos(): Promise<ConnectedRepo[]> {
  const { data } = await apiClient.get<ConnectedRepo[]>("/repositories");

  return data;
}

export async function connectRepository(
  fullName: string,
): Promise<ConnectedRepo> {
  const { data } = await apiClient.post<ConnectedRepo>("/repositories", {
    fullName,
  });
  return data;
}

export async function fetchRepositoryDetail(
  id: string,
): Promise<RepositoryDetail> {
  const { data } = await apiClient.get<RepositoryDetail>(`/repositories/${id}`);
  return data;
}

export async function submitRepositoryReview(
  id: string,
  action: "confirmed" | "flagged_outdated",
  note?: string,
): Promise<ConnectedRepo> {
  const { data } = await apiClient.post<ConnectedRepo>(
    `/repositories/${id}/review`,
    { action, note },
  );
  return data;
}

export async function disconnectRepository(id: string): Promise<void> {
  await apiClient.delete(`/repositories/${id}`);
}
