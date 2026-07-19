import { Router } from "express";
import { handleGithubWebhook } from "./webhook.controller";

const router = Router();

router.post("/github", handleGithubWebhook);

export default router;
