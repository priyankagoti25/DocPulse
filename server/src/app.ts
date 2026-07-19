import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { env } from "./config/env.js";
import routes from "./routes/index.js";
import { errorHandler } from "./middleware/errorHandler.middleware.js";

const app = express();

app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(morgan("dev"));

// Capture the raw body alongside the parsed JSON — needed for GitHub webhook
// signature verification, which must hash the exact bytes GitHub sent.
app.use(
  express.json({
    verify: (req: any, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(cookieParser());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api", routes);

app.use(errorHandler);

export default app;
