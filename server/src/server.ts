import http from "http";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import { env } from "./config/env.js";
import { initSocketServer } from "./websocket/socketServer.js";
import { scheduleNightlyRecompute } from "./jobs/recomputeScores.job.js";

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
