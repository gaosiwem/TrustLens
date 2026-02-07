import type { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { requireFeature } from "../../middleware/featureGate.js";

const prisma = new PrismaClient();

// Get Team Members
export const getTeamMembers = async (req: Request, res: Response) => {
  try {
    const brandId = req.params.id as string;

    // Ensure the current user has access to this brand
    // (Assuming middleware has already validated user is authenticated and part of the brand)

    const members = await prisma.brandMember.findMany({
      where: { brandId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true, // System role
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    res.json(
      members.map((m) => ({
        userId: m.userId,
        name: m.user.name,
        email: m.user.email,
        role: m.role, // Brand role (ADMIN vs AGENT)
        joinedAt: m.createdAt,
      })),
    );
  } catch (error) {
    console.error("Error fetching team:", error);
    res.status(500).json({ error: "Failed to fetch team members" });
  }
};

// Invite Team Member
export const inviteTeamMember = async (req: Request, res: Response) => {
  try {
    const brandId = req.params.id as string;
    const { email } = req.body;

    if (!email) return res.status(400).json({ error: "Email is required" });

    // 1. Check if user exists in the system
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({
        error:
          "User not found. They must register for a TrustLens account first.",
      });
    }

    // 2. Check if already a member
    const existingMember = await prisma.brandMember.findUnique({
      where: {
        brandId_userId: {
          brandId,
          userId: user.id,
        },
      },
    });

    if (existingMember) {
      return res.status(400).json({ error: "User is already a team member." });
    }

    // 3. Add to team
    // Only BUSINESS/ENTERPRISE/SCALE plans allow >1 seat, check feature gate or seat count
    // (Simplified for now, assuming feature gate middleware handles general access)

    const newMember = await prisma.brandMember.create({
      data: {
        brandId,
        userId: user.id,
        role: "AGENT", // Default role
      },
    });

    res
      .status(201)
      .json({ message: "Member added successfully", member: newMember });
  } catch (error) {
    console.error("Error inviting member:", error);
    res.status(500).json({ error: "Failed to invite member" });
  }
};

// Remove Team Member
export const removeTeamMember = async (req: Request, res: Response) => {
  try {
    const brandId = req.params.id as string;
    const userId = req.params.userId as string;

    // Prevent removing self? (Optional logic)

    await prisma.brandMember.delete({
      where: {
        brandId_userId: {
          brandId,
          userId,
        },
      },
    });

    res.json({ message: "Team member removed." });
  } catch (error) {
    console.error("Error removing member:", error);
    res.status(500).json({ error: "Failed to remove member" });
  }
};
