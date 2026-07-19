import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { socket } from "../lib/socket";

interface RepoScoreUpdatedPayload {
  newScore: number;
  newStatus: string;
}

export function useRepoWebSocket(repositoryId: string | undefined) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!repositoryId) return;

    // Server-side room membership is cleared whenever Socket.IO reconnects.
    // Rejoin on every connection, not only when this component first mounts.
    const joinRepositoryRoom = () => socket.emit("join-repo", repositoryId);

    const handleScoreUpdate = (payload: RepoScoreUpdatedPayload) => {
      queryClient.setQueriesData<any[]>(
        { queryKey: ["repositories"], exact: false },
        (old) =>
          old?.map((repo) =>
            repo._id === repositoryId
              ? {
                  ...repo,
                  currentScore: payload.newScore,
                  status: payload.newStatus,
                }
              : repo,
          ),
      );

      queryClient.invalidateQueries({
        queryKey: ["repository-detail", repositoryId],
      });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
    };

    socket.on("repo:score-updated", handleScoreUpdate);
    socket.on("connect", joinRepositoryRoom);
    if (socket.connected) joinRepositoryRoom();

    return () => {
      if (socket.connected) socket.emit("leave-repo", repositoryId);
      socket.off("repo:score-updated", handleScoreUpdate);
      socket.off("connect", joinRepositoryRoom);
    };
  }, [repositoryId, queryClient]);
}

/**
 * The dashboard displays aggregate data, but score events are emitted to
 * repository rooms. Join every repository room shown in its list so those
 * events can refresh the summary and repository list without a page reload.
 */
export function useDashboardWebSocket(repositoryIds: string[]) {
  const queryClient = useQueryClient();
  const roomKey = repositoryIds.join(",");

  useEffect(() => {
    if (repositoryIds.length === 0) return;

    const joinRepositoryRooms = () => {
      repositoryIds.forEach((repositoryId) => socket.emit("join-repo", repositoryId));
    };
    const handleScoreUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ["repositories"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
    };

    socket.on("connect", joinRepositoryRooms);
    socket.on("repo:score-updated", handleScoreUpdate);
    if (socket.connected) joinRepositoryRooms();

    return () => {
      if (socket.connected) {
        repositoryIds.forEach((repositoryId) => socket.emit("leave-repo", repositoryId));
      }
      socket.off("connect", joinRepositoryRooms);
      socket.off("repo:score-updated", handleScoreUpdate);
    };
  }, [queryClient, roomKey]);
}
