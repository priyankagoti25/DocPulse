import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware";
import {
  getDashboardSummary,
  postManualRecompute,
} from "./dashboard.controller";

const router = Router();

router.get("/summary", requireAuth, getDashboardSummary);

router.post("/recompute", requireAuth, postManualRecompute);
export default router;
