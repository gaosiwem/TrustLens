import { Router, type Request, type Response } from "express";
import {
  createBrandController,
  getBrandsController,
  deleteBrandController,
  toggleBrandVerificationController,
  updateBrandController,
  searchBrandsController,
  getPublicBrandProfileController,
  getBrandTrustScoreController,
  getBrandEnforcementsController,
} from "./brand.controller.js";
import {
  authenticate,
  authenticateAdmin,
} from "../../middleware/auth.middleware.js";
import { upload } from "../../middleware/upload.middleware.js";
import prisma from "../../prismaClient.js";

import { evaluateBrandClaimScore } from "../ai/ai.service.js";
import { isCorporateEmail } from "../../utils/email.utils.js";
import logger from "../../config/logger.js";

const router = Router();

// Public brand claim route (requires authentication)
router.post(
  "/claim",
  authenticate,
  upload.array("files", 5),
  async (req: Request, res: Response) => {
    try {
      logger.info("DEBUG: Brand claim request received", {
        body: req.body,
        files: (req.files as any[])?.map((f) => ({
          originalname: f.originalname,
          mimetype: f.mimetype,
          size: f.size,
        })),
      });
      const { brandName, email, websiteUrl } = req.body;
      const user = (req as any).user;
      const files = (req.files as Express.Multer.File[]) || [];

      if (!brandName || !email) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // 1. Corporate Email Check
      if (!isCorporateEmail(email)) {
        return res.status(400).json({
          error:
            "Please use a corporate email address to claim a brand. Personal emails (Gmail, Yahoo, etc.) are not accepted for brand claims.",
        });
      }

      logger.info("Processing claim for:", {
        brandName,
        email,
        filesCount: files.length,
      });

      // 2. Real AI confidence scoring
      const documentNames = files.map((f) => f.originalname);
      const aiScore = await evaluateBrandClaimScore(
        brandName,
        email,
        documentNames
      );

      // Save file paths
      const documents = files.map((f) => `/uploads/${f.filename}`);

      logger.info("Saving to database with data:", {
        userId: user.userId,
        brandName,
        email,
        websiteUrl: websiteUrl || null,
        aiScore,
        documents,
      });

      // 3. Save to database
      const claim = await prisma.brandClaim.create({
        data: {
          userId: user.userId,
          brandName,
          email,
          websiteUrl: websiteUrl || null,
          aiScore,
          documents,
          status: "PENDING",
        },
      });
      logger.info("Database save successful:", { claimId: claim.id });

      res.json({
        success: true,
        aiScore,
        message: "Brand claim submitted successfully",
      });
    } catch (error: any) {
      logger.error("Detailed Brand claim submission error:", error);
      res.status(500).json({
        error: error.message,
      });
    }
  }
);

router.post(
  "/",
  authenticate,
  authenticateAdmin,
  upload.single("logo"),
  createBrandController
);
router.get("/public/search", searchBrandsController);
router.get("/public/:id", getPublicBrandProfileController);
router.get("/", authenticate, getBrandsController);

// Admin-only routes
router.patch(
  "/:id",
  authenticate,
  upload.single("logo"),
  updateBrandController
);
router.delete("/:id", authenticate, authenticateAdmin, deleteBrandController);
router.patch(
  "/:id/verify",
  authenticate,
  authenticateAdmin,
  toggleBrandVerificationController
);

router.get("/:id/trust-score", authenticate, getBrandTrustScoreController);
router.get("/:id/enforcements", authenticate, getBrandEnforcementsController);

export default router;
