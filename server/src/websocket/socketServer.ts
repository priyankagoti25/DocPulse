import { Server as HttpServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { env } from "../config/env";

let io: SocketIOServer | null = null;

export function initSocketServer(httpServer: HttpServer): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    cors: { origin: env.CLIENT_URL, credentials: true },
  });

  io.on("connection", (socket) => {
    console.log(`[socket] client connected: ${socket.id}`);

    socket.on("join-repo", (repositoryId: string) => {
      socket.join(`repo:${repositoryId}`);
      console.log(`[socket] ${socket.id} joined room repo:${repositoryId}`);
    });

    socket.on("leave-repo", (repositoryId: string) => {
      socket.leave(`repo:${repositoryId}`);
      console.log(`[socket] ${socket.id} left room repo:${repositoryId}`);
    });

    socket.on("disconnect", (reason) => {
      console.log(`[socket] client disconnected: ${socket.id} (${reason})`);
    });
  });

  return io;
}

export function emitRepoScoreUpdated(
  repositoryId: string,
  payload: { newScore: number; newStatus: string },
): void {
  if (!io) {
    console.log(
      "[socket] emitRepoScoreUpdated called but io is not initialized",
    );
    return;
  }

  const room = `repo:${repositoryId}`;
  const clientsInRoom = io.sockets.adapter.rooms.get(room)?.size ?? 0;
  console.log(
    `[socket] emitting repo:score-updated to room ${room} (${clientsInRoom} client(s) in room)`,
    payload,
  );

  io.to(room).emit("repo:score-updated", payload);
}
