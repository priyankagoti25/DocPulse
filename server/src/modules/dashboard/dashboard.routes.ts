import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.js";
import {
  getDashboardSummary,
  postManualRecompute,
} from "./dashboard.controller.js";

const router = Router();

router.get("/summary", requireAuth, getDashboardSummary);

router.post("/recompute", requireAuth, postManualRecompute);
export default router;
