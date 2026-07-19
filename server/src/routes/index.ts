import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes";
import repositoryRoutes from "../modules/repositories/repository.routes";
import webhookRoutes from "../modules/webhooks/webhook.routes";
import dashboardRoutes from "../modules/dashboard/dashboard.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/repositories", repositoryRoutes);
router.use("/webhooks", webhookRoutes);
router.use("/dashboard", dashboardRoutes);

export default router;
