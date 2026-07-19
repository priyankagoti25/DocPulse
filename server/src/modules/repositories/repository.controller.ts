import { Response } from "express";
import { AuthenticatedRequest } from "../../middleware/auth.middleware.js";
import {
  listAvailableRepos,
  connectRepository,
  listRepositoriesForUser,
  getRepositoryDetail,
  submitRepositoryReview,
  deleteRepository,
} from "./repository.service.js";

export async function getAvailableRepos(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  try {
    const repos = await listAvailableRepos(req.userId!);
    res.json(repos);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
}

export async function postConnectRepository(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  const { fullName } = req.body;

  if (!fullName) {
    res.status(400).json({ message: "fullName is required" });
    return;
  }

  try {
    const repository = await connectRepository(req.userId!, fullName);
    res.status(201).json(repository);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
}

export async function getMyRepositories(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  const repos = await listRepositoriesForUser(req.userId!);
  console.log("repos-->", repos);
  res.json(repos);
}

export async function getRepository(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  try {
    const result = await getRepositoryDetail(req.params.id);
    res.json(result);
  } catch (err: any) {
    res.status(404).json({ message: err.message });
  }
}

export async function postRepositoryReview(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  const { action, note } = req.body;

  if (!["confirmed", "flagged_outdated"].includes(action)) {
    res.status(400).json({ message: "Invalid action" });
    return;
  }

  try {
    const repository = await submitRepositoryReview(
      req.params.id,
      req.userId!,
      action,
      note ?? null,
    );
    res.json(repository);
  } catch (err: any) {
    res.status(404).json({ message: err.message });
  }
}

export async function deleteMyRepository(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  try {
    await deleteRepository(req.userId!, req.params.id);
    res.status(204).send();
  } catch (err: any) {
    res.status(404).json({ message: err.message });
  }
}
