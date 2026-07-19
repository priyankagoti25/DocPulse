import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.js";
import {
  getAvailableRepos,
  postConnectRepository,
  getMyRepositories,
  getRepository,
  postRepositoryReview,
  deleteMyRepository,
} from "./repository.controller.js";

const router = Router();

router.use(requireAuth);

router.get("/available", getAvailableRepos);
router.get("/", getMyRepositories);
router.post("/", postConnectRepository);
router.get("/:id", getRepository);
router.post("/:id/review", postRepositoryReview);
router.delete("/:id", deleteMyRepository);

export default router;
