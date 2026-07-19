import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchRepositoryDetail,
  submitRepositoryReview,
} from "../features/repositories/api";
import { useRepoWebSocket } from "../shared/hooks/useWebSocket";

const statusColors: Record<string, string> = {
  fresh: "bg-green-100 text-green-700",
  aging: "bg-yellow-100 text-yellow-700",
  stale: "bg-orange-100 text-orange-700",
  critical: "bg-red-100 text-red-700",
};

export function RepoDetailPage() {
  const { repositoryId } = useParams<{ repositoryId: string }>();
  const queryClient = useQueryClient();

  useRepoWebSocket(repositoryId);

  const { data, isLoading } = useQuery({
    queryKey: ["repository-detail", repositoryId],
    queryFn: () => fetchRepositoryDetail(repositoryId!),
    enabled: !!repositoryId,
  });

  const reviewMutation = useMutation({
    mutationFn: (action: "confirmed" | "flagged_outdated") =>
      submitRepositoryReview(repositoryId!, action),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["repository-detail", repositoryId],
      });
      queryClient.invalidateQueries({ queryKey: ["repositories"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
    },
  });

  if (!repositoryId) return null;

  return (
    <div className="mx-auto w-full max-w-3xl p-4 sm:p-6">
      <Link
        to="/dashboard"
        className="text-sm text-gray-400 hover:text-gray-600 mb-4 inline-block"
      >
        ← Back to dashboard
      </Link>

      {isLoading || !data ? (
        <p className="text-gray-500 text-sm">Loading...</p>
      ) : (
        <div className="max-w-2xl">
          <h1 className="mb-4 break-all text-xl font-semibold text-gray-800 sm:break-normal">
            {data.repository.fullName}
          </h1>

          <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-xs text-gray-400 mb-1">Freshness score</p>
              <p className="text-2xl font-semibold text-gray-800">
                {data.repository.currentScore}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-xs text-gray-400 mb-1">Status</p>
              <span
                className={`text-sm px-2 py-0.5 rounded-full ${statusColors[data.repository.status]}`}
              >
                {data.repository.status}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 mb-4">
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                onClick={() => reviewMutation.mutate("confirmed")}
                disabled={reviewMutation.isPending}
                className="flex-1 bg-green-600 text-white text-sm py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                ✅ Confirm still accurate
              </button>
              <button
                onClick={() => reviewMutation.mutate("flagged_outdated")}
                disabled={reviewMutation.isPending}
                className="flex-1 bg-red-500 text-white text-sm py-2 rounded-md hover:bg-red-600 disabled:opacity-50"
              >
                ❌ Flag outdated
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Last reviewed:{" "}
              {data.repository.lastReviewedAt
                ? new Date(data.repository.lastReviewedAt).toLocaleString()
                : "never"}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-4 mb-4">
            <p className="text-xs text-gray-400 mb-2">Recent code changes</p>
            {data.changeEvents.length === 0 && (
              <p className="text-xs text-gray-400">No changes recorded yet.</p>
            )}
            {data.changeEvents.map((event) => (
              <div key={event._id} className="break-words border-b py-2 text-xs last:border-0">
                <span className="font-mono text-gray-600">
                  {event.commitSha.slice(0, 7)}
                </span>{" "}
                — {event.filesChanged.length} file(s), ~{event.linesChanged}{" "}
                line(s) — {new Date(event.pushedAt).toLocaleString()}
              </div>
            ))}
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-xs text-gray-400 mb-2">Review history</p>
            {data.reviewHistory.length === 0 && (
              <p className="text-xs text-gray-400">No reviews yet.</p>
            )}
            {data.reviewHistory.map((review) => (
              <div key={review._id} className="break-words border-b py-2 text-xs last:border-0">
                <span className="font-medium">{review.action}</span> —{" "}
                {new Date(review.createdAt).toLocaleString()}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
