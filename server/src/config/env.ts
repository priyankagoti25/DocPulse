import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default("5000"),
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  DB_NAME: z.string().min(1, "DB_NAME is required"),
  JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),
  GITHUB_CLIENT_ID: z.string().min(1, "GITHUB_CLIENT_ID is required"),
  GITHUB_CLIENT_SECRET: z.string().min(1, "GITHUB_CLIENT_SECRET is required"),
  GITHUB_CALLBACK_URL: z.string().min(1, "GITHUB_CALLBACK_URL is required"),
  GITHUB_WEBHOOK_SECRET: z.string().min(1, "GITHUB_WEBHOOK_SECRET is required"),
  SERVER_BASE_URL: z
    .string()
    .default("https://scoured-cinema-boogieman.ngrok-free.dev"),
  CLIENT_URL: z.string().default("http://localhost:5173"),
});

export const env = envSchema.parse(process.env);
