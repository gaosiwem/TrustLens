import type { Request, Response } from "express";
import {
  createRating,
  getRatingsForComplaint,
  getUserRating,
  getRecentRatings,
} from "./rating.service.js";

export async function createRatingController(req: Request, res: Response) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { complaintId, stars, comment } = req.body;

    if (!complaintId || !stars) {
      return res
        .status(400)
        .json({ error: "Complaint ID and stars are required" });
    }

    const rating = await createRating({
      userId,
      complaintId,
      stars: Number(stars),
      comment,
    });

    res.json(rating);
  } catch (error: any) {
    console.error("Failed to create rating:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
}

export async function getRatingsController(req: Request, res: Response) {
  try {
    const { complaintId } = req.params;

    if (!complaintId) {
      return res.status(400).json({ error: "Complaint ID is required" });
    }

    const result = await getRatingsForComplaint(complaintId);
    res.json(result);
  } catch (error) {
    console.error("Failed to get ratings:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function getUserRatingController(req: Request, res: Response) {
  try {
    const userId = req.user?.userId;
    const { complaintId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!complaintId) {
      return res.status(400).json({ error: "Complaint ID is required" });
    }

    const rating = await getUserRating(userId, complaintId);
    res.json(rating || null);
  } catch (error) {
    console.error("Failed to get user rating:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function getRecentRatingsController(req: Request, res: Response) {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const ratings = await getRecentRatings(limit);
    res.json(ratings);
  } catch (error) {
    console.error("Failed to get recent ratings:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
