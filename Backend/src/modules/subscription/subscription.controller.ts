import type { Request, Response } from "express";
import prisma from "../../lib/prisma.js";
import { billingService } from "../billing/billing.service.js";
import { issuePaidInvoice } from "../billing/invoice.service.js";

export async function createCheckoutSession(req: any, res: Response) {
  try {
    const { planCode } = req.body;
    let brandId = req.user.brandId;
    console.log(`[Checkout] Request for plan: ${planCode}, brand: ${brandId}`);

    // For BRAND users, look up their managed brand
    if (!brandId && req.user.role === "BRAND") {
      const managedBrand = await prisma.brand.findFirst({
        where: { managerId: req.user.userId },
        select: { id: true },
      });
      brandId = managedBrand?.id;
    }

    if (!brandId) {
      return res
        .status(400)
        .json({ error: "User is not associated with a brand." });
    }

    // Lookup the plan first
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { code: planCode },
    });

    if (!plan) {
      console.log(`[Checkout] Plan NOT found for code: ${planCode}`);
      return res.status(404).json({ error: "Subscription plan not found." });
    }
    console.log(
      `[Checkout] Plan found: ${plan.name}, price: ${plan.monthlyPrice}`,
    );

    // Check for existing active subscription for THIS PLAN to prevent duplicates
    const activeSubscription = await prisma.brandSubscription.findFirst({
      where: {
        brandId,
        planId: plan.id,
        status: "ACTIVE",
      },
    });

    if (activeSubscription) {
      return res.status(400).json({
        error: `You already have an active ${planCode} subscription.`,
      });
    }

    const isVerifiedPlan = planCode.includes("VERIFIED");
    const returnUrl = isVerifiedPlan
      ? `${process.env.FRONTEND_URL}/brand/verified/success?plan=${planCode}`
      : `${process.env.FRONTEND_URL}/brand/subscription/success?plan=${planCode}`;

    const cancelUrl = isVerifiedPlan
      ? `${process.env.FRONTEND_URL}/brand/verified/subscribe`
      : `${process.env.FRONTEND_URL}/brand/pricing`;

    const payload = billingService.generatePayFastPayload({
      brandId,
      planCode: plan.code,
      planName: plan.name,
      amount: plan.monthlyPrice, // This is now the annual price for verified plans
      returnUrl,
      cancelUrl,
      notifyUrl: `${process.env.API_URL}/subscriptions/webhook`,
      userEmail: req.user.email,
    });

    res.json(payload);
  } catch (error) {
    console.error("Error creating checkout session:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function handleWebhook(req: Request, res: Response) {
  try {
    const data = req.body;
    const receivedSignature = data.signature;

    if (!billingService.verifySignature(data, receivedSignature)) {
      console.warn("Invalid PayFast signature received.");
      return res.status(400).end();
    }

    const {
      payment_status,
      custom_str1: brandId,
      custom_str2: planCode,
      m_payment_id,
      amount_gross,
    } = data;

    if (payment_status !== "COMPLETE") {
      return res.status(200).end();
    }

    const plan = await prisma.subscriptionPlan.findUnique({
      where: { code: planCode },
    });

    if (!plan) {
      console.error(`Plan ${planCode} not found during webhook processing.`);
      return res.status(400).end();
    }

    // Calculate duration (1 year for verified plans, 30 days for others)
    const isVerifiedPlan = planCode.includes("VERIFIED");
    const durationDays = isVerifiedPlan ? 365 : 30;
    const endsAt = new Date();
    endsAt.setDate(endsAt.getDate() + durationDays);

    // Find existing subscription for this brand + plan combination
    const existingSub = await prisma.brandSubscription.findFirst({
      where: { brandId, planId: plan.id },
    });

    let subscription;
    if (existingSub) {
      subscription = await prisma.brandSubscription.update({
        where: { id: existingSub.id },
        data: {
          status: "ACTIVE",
          startedAt: new Date(),
          endsAt,
          gatewayRef: m_payment_id,
        },
      });
    } else {
      subscription = await prisma.brandSubscription.create({
        data: {
          brandId,
          planId: plan.id,
          status: "ACTIVE",
          startedAt: new Date(),
          endsAt,
          gatewayRef: m_payment_id,
        },
      });
    }

    // If it's a verified plan, create VerifiedSubscription history if a request exists
    if (isVerifiedPlan) {
      // Note: We do NOT automatically set brand.isVerified = true here.
      // Verification requires document approval.
      // The user will now be in "paid_pending" state until they upload docs and admin approves.

      const latestRequest = await prisma.verifiedRequest.findFirst({
        where: { brandId },
        orderBy: { createdAt: "desc" },
      });

      if (latestRequest) {
        await prisma.verifiedSubscription.create({
          data: {
            userId: latestRequest.userId, // use the requester's ID
            verifiedRequestId: latestRequest.id,
            status: "ACTIVE",
            paymentGateway: "PAYFAST",
            paymentReference: m_payment_id,
            amount: Number(amount_gross),
            startDate: new Date(),
            endDate: endsAt,
          },
        });
      }
    }

    // log transaction
    await prisma.paymentTransaction.create({
      data: {
        brandId,
        subscriptionId: subscription.id,
        amount: Math.round(Number(amount_gross) * 100),
        currency: "ZAR",
        gateway: "PAYFAST",
        gatewayRef: m_payment_id,
        status: "SUCCESS",
      },
    });

    // Issue invoice (Sprint 20)
    await issuePaidInvoice({
      brandId,
      subscriptionId: subscription.id,
      amountGross: Math.round(Number(amount_gross) * 100),
    });

    res.status(200).end();
  } catch (error) {
    console.error("Error handling PayFast webhook:", error);
    res.status(500).end();
  }
}

export async function getCurrentSubscription(req: any, res: Response) {
  try {
    let brandId = req.user.brandId;

    // For BRAND users, look up their managed brand
    if (!brandId && req.user.role === "BRAND") {
      const managedBrand = await prisma.brand.findFirst({
        where: { managerId: req.user.userId },
        select: { id: true },
      });
      brandId = managedBrand?.id;
    }

    if (!brandId) {
      return res.json({ plan: "FREE", activePlans: [] });
    }

    // Get ALL active subscriptions for this brand
    const subscriptions = await prisma.brandSubscription.findMany({
      where: { brandId, status: "ACTIVE" },
      include: { plan: true },
    });

    if (subscriptions.length === 0) {
      return res.json({ plan: "FREE", activePlans: [] });
    }

    // Return the "primary" plan (prefer Verified > Intelligence) for backwards compatibility
    // Also return all active plans for the pricing page to check
    const verifiedSub = subscriptions.find((s) =>
      s.plan.code.includes("VERIFIED"),
    );
    const primarySub = verifiedSub || subscriptions[0]!;

    // Merge features from ALL active subscriptions
    // This allows a brand with PRO + BASIC_VERIFIED to get features from both
    const mergedFeatures: Record<string, any> = {};
    for (const sub of subscriptions) {
      const planFeatures = sub.plan.features as Record<string, any>;
      for (const [key, value] of Object.entries(planFeatures)) {
        // For boolean features: true wins over false
        // For numeric features: take the higher value (e.g. maxTeamSeats)
        if (typeof value === "boolean") {
          mergedFeatures[key] = mergedFeatures[key] || value;
        } else if (typeof value === "number") {
          mergedFeatures[key] = Math.max(mergedFeatures[key] || 0, value);
        } else {
          // For strings or other types, prefer the first non-null value
          mergedFeatures[key] = mergedFeatures[key] ?? value;
        }
      }
    }

    res.json({
      plan: primarySub.plan.code,
      status: primarySub.status,
      expiresAt: primarySub.endsAt,
      features: mergedFeatures,
      // Return all active plan codes
      activePlans: subscriptions.map((s) => s.plan.code),
    });
  } catch (error) {
    console.error("Error getting current subscription:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function activateDevSubscription(req: any, res: Response) {
  console.log("[DEV_ACTIVATE] Starting dev subscription activation...");
  console.log("[DEV_ACTIVATE] User:", req.user);
  console.log("[DEV_ACTIVATE] Body:", req.body);

  // Only allow in development or for SUPER_ADMIN
  if (
    process.env.NODE_ENV === "production" &&
    req.user?.role !== "SUPER_ADMIN"
  ) {
    console.log("[DEV_ACTIVATE] Blocked: production mode without SUPER_ADMIN");
    return res.status(403).json({ error: "Unauthorized" });
  }

  try {
    const { planCode } = req.body;
    let brandId = req.user.brandId;

    console.log(`[DEV_ACTIVATE] Initial brandId from token: ${brandId}`);
    console.log(`[DEV_ACTIVATE] planCode: ${planCode}`);

    if (!brandId && req.user.role === "BRAND") {
      console.log(
        "[DEV_ACTIVATE] Looking up managed brand for user:",
        req.user.userId,
      );
      const managedBrand = await prisma.brand.findFirst({
        where: { managerId: req.user.userId },
        select: { id: true, name: true },
        orderBy: { createdAt: "desc" },
      });
      console.log("[DEV_ACTIVATE] Found managed brand:", managedBrand);
      brandId = managedBrand?.id;
    }

    if (!brandId) {
      console.error("[DEV_ACTIVATE] ERROR: No brand associated with user");
      return res.status(400).json({ error: "No brand associated" });
    }

    console.log(`[DEV_ACTIVATE] Using brandId: ${brandId}`);

    const plan = await prisma.subscriptionPlan.findUnique({
      where: { code: planCode },
    });

    console.log("[DEV_ACTIVATE] Found plan:", plan);

    if (!plan) {
      console.error(
        `[DEV_ACTIVATE] ERROR: Plan not found for code: ${planCode}`,
      );
      return res.status(404).json({ error: "Plan not found" });
    }

    const isVerifiedPlan = planCode.includes("VERIFIED");
    const durationDays = isVerifiedPlan ? 365 : 30;
    const endsAt = new Date();
    endsAt.setDate(endsAt.getDate() + durationDays);

    console.log(
      `[DEV_ACTIVATE] isVerifiedPlan: ${isVerifiedPlan}, duration: ${durationDays} days`,
    );
    console.log(`[DEV_ACTIVATE] Upserting BrandSubscription...`);

    // Find existing subscription for this brand + plan combination
    const existingSub = await prisma.brandSubscription.findFirst({
      where: { brandId, planId: plan.id },
    });

    let subscription;
    if (existingSub) {
      subscription = await prisma.brandSubscription.update({
        where: { id: existingSub.id },
        data: {
          status: "ACTIVE",
          startedAt: new Date(),
          endsAt,
          gatewayRef: "DEV_ACTIVATE",
        },
      });
    } else {
      subscription = await prisma.brandSubscription.create({
        data: {
          brandId,
          planId: plan.id,
          status: "ACTIVE",
          startedAt: new Date(),
          endsAt,
          gatewayRef: "DEV_ACTIVATE",
        },
      });
    }

    console.log("[DEV_ACTIVATE] BrandSubscription upserted:", subscription);

    // Handle Verified status and subscription
    if (isVerifiedPlan) {
      console.log(
        "[DEV_ACTIVATE] Handling verified plan logic (Active subscription state)...",
      );
      // Note: We do NOT set isVerified=true here anymore.
      // Devs should approve the document request to verify.

      // await prisma.brand.update({
      //   where: { id: brandId },
      //   data: { isVerified: true },
      // });
      console.log("[DEV_ACTIVATE] Brand.isVerified updated.");

      // Also try to link to a verified request if it exists
      const latestRequest = await prisma.verifiedRequest.findFirst({
        where: { brandId },
        orderBy: { createdAt: "desc" },
      });

      console.log("[DEV_ACTIVATE] Latest VerifiedRequest:", latestRequest);

      if (latestRequest) {
        console.log("[DEV_ACTIVATE] Upserting VerifiedSubscription...");
        const verifiedSub = await prisma.verifiedSubscription.upsert({
          where: { id: `DEV_${latestRequest.id}` },
          update: {
            status: "ACTIVE",
            startDate: new Date(),
            endDate: endsAt,
            paymentReference: "DEV_ACTIVATE",
          },
          create: {
            id: `DEV_${latestRequest.id}`,
            userId: latestRequest.userId,
            verifiedRequestId: latestRequest.id,
            status: "ACTIVE",
            startDate: new Date(),
            endDate: endsAt,
            paymentGateway: "DEV",
            paymentReference: "DEV_ACTIVATE",
            amount: plan.monthlyPrice,
          },
        });
        console.log(
          "[DEV_ACTIVATE] VerifiedSubscription upserted:",
          verifiedSub,
        );
      } else {
        console.log(
          "[DEV_ACTIVATE] No VerifiedRequest found, skipping VerifiedSubscription",
        );
      }
    }

    console.log("[DEV_ACTIVATE] SUCCESS - responding with subscription");
    res.json({
      message: `Plan ${planCode} activated for development.`,
      subscription,
    });
  } catch (error) {
    console.error("[DEV_ACTIVATE] ERROR:", error);
    res.status(500).json({ error: "Failed to activate dev subscription" });
  }
}
