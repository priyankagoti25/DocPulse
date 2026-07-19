import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchConnectedRepos, disconnectRepository } from "../api";
import { useRepoStore } from "../store/repoStore";
import { useDashboardWebSocket } from "../../../shared/hooks/useWebSocket";

const statusColors: Record<string, string> = {
  fresh: "bg-green-100 text-green-700",
  aging: "bg-yellow-100 text-yellow-700",
  stale: "bg-orange-100 text-orange-700",
  critical: "bg-red-100 text-red-700",
};

export function RepoList() {
  const queryClient = useQueryClient();
  const { openConnectModal } = useRepoStore();

  const { data: repos, isLoading } = useQuery({
    queryKey: ["repositories"],
    queryFn: fetchConnectedRepos,
  });
  useDashboardWebSocket(repos?.map((repo) => repo._id) ?? []);

  const disconnectMutation = useMutation({
    mutationFn: disconnectRepository,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["repositories"] }),
  });

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold text-gray-800">
          Connected repositories
        </h2>
        <button
          onClick={openConnectModal}
          className="w-full rounded-md bg-gray-900 px-3 py-2 text-sm text-white hover:bg-gray-800 sm:w-auto sm:py-1.5"
        >
          + Connect repo
        </button>
      </div>

      {isLoading && <p className="text-gray-500 text-sm">Loading...</p>}

      {repos?.length === 0 && (
        <p className="text-gray-500 text-sm">No repositories connected yet.</p>
      )}

      <div className="space-y-2">
        {repos?.map((repo) => (
          <div
            key={repo._id}
            className="flex flex-col gap-3 rounded-md border p-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <Link
              to={`/repositories/${repo._id}`}
              className="min-w-0 break-all font-medium text-gray-800 hover:underline sm:break-normal"
            >
              {repo.fullName}
            </Link>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 sm:justify-end">
              <span className="font-mono text-sm text-gray-600">
                {repo.currentScore}
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${statusColors[repo.status]}`}
              >
                {repo.status}
              </span>
              <button
                onClick={() => disconnectMutation.mutate(repo._id)}
                className="text-xs text-red-500 hover:underline"
              >
                Disconnect
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
