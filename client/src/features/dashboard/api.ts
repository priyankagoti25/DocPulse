import { apiClient } from "../../shared/lib/apiClient";

export interface DashboardSummary {
  totalRepos: number;
  averageScore: number;
  statusCounts: {
    fresh: number;
    aging: number;
    stale: number;
    critical: number;
  };
}

export async function fetchDashboardSummary(): Promise<DashboardSummary> {
  const { data } = await apiClient.get<DashboardSummary>("/dashboard/summary");
  return data;
}
