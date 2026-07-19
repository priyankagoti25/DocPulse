import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes.js";
import repositoryRoutes from "../modules/repositories/repository.routes.js";
import webhookRoutes from "../modules/webhooks/webhook.routes.js";
import dashboardRoutes from "../modules/dashboard/dashboard.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/repositories", repositoryRoutes);
router.use("/webhooks", webhookRoutes);
router.use("/dashboard", dashboardRoutes);

export default router;
