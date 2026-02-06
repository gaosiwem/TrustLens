import { type Request, type Response } from "express";
import {
  getUsers,
  getUserProfile,
  updateUserProfile,
  adminUpdateUser,
} from "./user.service.js";

export async function adminUpdateUserController(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { name, role } = req.body;
    if (!id) return res.status(400).json({ error: "Missing user ID" });

    const user = await adminUpdateUser(id as string, { name, role });
    res.json(user);
  } catch (error) {
    console.error("Admin update user error:", error);
    res.status(500).json({ error: "Failed to update user" });
  }
}

export async function getUsersController(req: Request, res: Response) {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
    const sortBy = (req.query.sortBy as string) || "createdAt";
    const sortOrder = (req.query.sortOrder as "asc" | "desc") || "desc";
    const search = req.query.search as string;

    const result = await getUsers({
      limit,
      offset,
      sortBy,
      sortOrder,
      search,
    });
    res.json(result);
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
}

export async function getUserProfileController(req: Request, res: Response) {
  try {
    const userId = (req as any).user.userId || (req as any).user.id;
    const user = await getUserProfile(userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function updateUserProfileController(req: Request, res: Response) {
  try {
    const userId = (req as any).user.userId || (req as any).user.id;
    const { name } = req.body;
    const user = await updateUserProfile(userId, { name });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
}
