import http from "http";
import app from "./app";
import { connectDB } from "./config/db";
import { env } from "./config/env";
import { initSocketServer } from "./websocket/socketServer";
import { scheduleNightlyRecompute } from "./jobs/recomputeScores.job";

async function bootstrap() {
  await connectDB();

  const server = http.createServer(app);
  initSocketServer(server);
  scheduleNightlyRecompute();

  server.listen(env.PORT, () => {
    console.log(`[server] Listening on port ${env.PORT}`);
  });
}

bootstrap();
