import prisma from "../../lib/prisma.js";
import { findBrandLogo } from "./logo.service.js";
import logger from "../../config/logger.js";
import { logAction } from "../audit/audit.service.js";

export async function resolveBrand(
  name: string,
  isVerified: boolean = false,
  logoUrl?: string,
  managerId?: string,
  domainHint?: string,
) {
  const normalized = name.trim();

  let brand = await prisma.brand.findFirst({
    where: { name: { equals: normalized, mode: "insensitive" } },
  });

  if (!brand) {
    const newBrand = await (prisma.brand.create({
      data: {
        name: normalized,
        isVerified,
        logoUrl: logoUrl ?? null,
        managerId: managerId ?? null,
      } as any,
    }) as any);
    brand = newBrand;
  } else if (isVerified || managerId || logoUrl) {
    // Update existing brand with verification, manager info, or explicitly provided logo
    brand = await (prisma.brand.update({
      where: { id: brand.id },
      data: {
        isVerified: isVerified || (brand as any).isVerified,
        managerId: managerId || (brand as any).managerId,
        logoUrl: logoUrl || (brand as any).logoUrl,
      } as any,
    }) as any);
  }

  if (!brand) return null;

  // Fetch and update logo asynchronously if still missing
  if (!(brand as any).logoUrl) {
    logger.info(
      `Logo missing for brand ${normalized}, triggering async retrieval with hint: ${
        domainHint || "none"
      }...`,
    );
    findBrandLogo(normalized, domainHint)
      .then(async (foundLogo) => {
        if (foundLogo) {
          logger.info(
            `Updating brand ${normalized} with retrieved logo: ${foundLogo}`,
          );
          await prisma.brand.update({
            where: { id: (brand as any).id },
            data: { logoUrl: foundLogo },
          });
        }
      })
      .catch((err) =>
        logger.error(`Async logo resolution failed for ${normalized}:`, err),
      );
  }

  return brand;
}

export async function createBrand(
  name: string,
  isVerified: boolean = false,
  logoUrl?: string,
) {
  return resolveBrand(name, isVerified, logoUrl);
}

export async function getBrands(
  params: {
    limit?: number;
    offset?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    search?: string;
  } = {},
) {
  const {
    limit = 50,
    offset = 0,
    sortBy = "name",
    sortOrder = "asc",
    search,
  } = params;

  const where: any = {};

  if (search) {
    where.name = { contains: search, mode: "insensitive" };
  }

  const [items, total] = await Promise.all([
    prisma.brand.findMany({
      take: limit,
      skip: offset,
      where,
      orderBy: { [sortBy]: sortOrder },
      include: {
        subscriptions: {
          include: {
            plan: true,
          },
        },
      },
    }),
    prisma.brand.count({ where }),
  ]);

  return { items, total };
}

export async function searchBrandsWithRatings(query: string) {
  const brands = await prisma.brand.findMany({
    where: {
      name: { contains: query, mode: "insensitive" },
    },
    take: 5,
    include: {
      complaints: {
        select: {
          ratings: {
            select: { stars: true },
          },
        },
      },
    },
  });

  return brands.map((brand) => {
    let totalStars = 0;
    let totalRatings = 0;

    brand.complaints.forEach((complaint) => {
      complaint.ratings.forEach((rating) => {
        totalStars += rating.stars;
        totalRatings++;
      });
    });

    return {
      id: brand.id,
      name: brand.name,
      logoUrl: brand.logoUrl,
      isVerified: brand.isVerified,
      averageRating: totalRatings > 0 ? totalStars / totalRatings : 0,
      totalRatings,
      complaintCount: brand.complaints.length,
    };
  });
}

export async function deleteBrand(id: string) {
  return prisma.brand.delete({
    where: { id },
  });
}

export async function toggleBrandVerification(id: string) {
  const brand = await prisma.brand.findUnique({ where: { id } });
  if (!brand) throw new Error("Brand not found");

  return prisma.brand.update({
    where: { id: id },
    data: { isVerified: !brand.isVerified },
  });
}

export async function updateBrand(
  id: string,
  data: {
    name?: string;
    logoUrl?: string | null;
    isVerified?: boolean;
    description?: string;
    websiteUrl?: string;
    supportEmail?: string;
    supportPhone?: string;
  },
) {
  const updateData: any = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.logoUrl !== undefined) {
    updateData.logoUrl =
      data.logoUrl === "" || data.logoUrl === undefined ? null : data.logoUrl;
  }
  if (data.isVerified !== undefined) updateData.isVerified = data.isVerified;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.websiteUrl !== undefined) updateData.websiteUrl = data.websiteUrl;
  if (data.supportEmail !== undefined)
    updateData.supportEmail = data.supportEmail;
  if (data.supportPhone !== undefined)
    updateData.supportPhone = data.supportPhone;

  return prisma.brand.update({
    where: { id },
    data: updateData,
  });
}

export async function getBrandPublicProfile(params: {
  id: string;
  page: number;
  limit: number;
  stars?: number[] | undefined;
  search?: string;
  sortBy?: string;
  replied?: boolean | undefined;
  verified?: boolean | undefined;
}) {
  const {
    id,
    page,
    limit,
    stars,
    search,
    sortBy = "createdAt",
    replied,
    verified,
  } = params;
  const skip = (page - 1) * limit;

  // 1. Fetch brand metadata
  const brand = await prisma.brand.findUnique({
    where: { id },
    include: {
      subscriptions: {
        include: { plan: true },
      },
    },
  });

  if (!brand) return null;

  // 2. Fetch stats - Only count ratings from the complaint owner (original consumer)
  const [totalComplaints, ownerRatings, platformStats] = await Promise.all([
    prisma.complaint.count({ where: { brandId: id } }),
    // Get all complaints with their owner's rating
    prisma.complaint.findMany({
      where: { brandId: id },
      select: {
        userId: true,
        ratings: {
          select: { userId: true, stars: true },
        },
      },
    }),
    prisma.rating.aggregate({
      _avg: { stars: true },
      _count: { stars: true },
    }),
    // [NEW] Log the view
    // We fire and forget this to not slow down the response
    logAction({
      userId: "GUEST", // We don't have request context here easily unless passed.
      // Ideally we'd pass userId if available, but for now just tracking "views"
      action: "VIEW_PROFILE",
      entity: "BRAND",
      entityId: id,
    }).catch((err) => console.error("Failed to log view:", err)),
  ]);

  const ratingDistribution = [0, 0, 0, 0, 0];
  let totalStars = 0;
  let totalRatings = 0;

  // For each complaint, find the owner's rating and add it to distribution
  ownerRatings.forEach((complaint) => {
    const ownerRating = complaint.ratings.find(
      (r) => r.userId === complaint.userId,
    );
    if (ownerRating && ownerRating.stars >= 1 && ownerRating.stars <= 5) {
      const starIndex = ownerRating.stars - 1;
      const currentCount = ratingDistribution[starIndex];
      if (typeof currentCount === "number") {
        ratingDistribution[starIndex] = currentCount + 1;
        totalStars += ownerRating.stars;
        totalRatings++;
      }
    }
  });

  const averageRating = totalRatings > 0 ? totalStars / totalRatings : 0;

  // Bayesian Weighted Rating (TrustScore)
  // WR = (v * R + m * C) / (v + m)
  const v = totalRatings; // Number of reviews for this brand
  const m = 10; // Damping factor (fixed threshold)
  const R = averageRating; // Arithmetic mean of these reviews
  const C = 3.5; // Platform-wide average (fallback to 3.5)

  const trustScore = (v * R + m * C) / (v + m);

  // Secure IsVerified: Requires BOTH admin approval AND an active VERIFIED subscription
  const verifiedSub = brand.subscriptions?.find(
    (s: any) => s.status === "ACTIVE" && s.plan.code.includes("VERIFIED"),
  );

  const isActiveVerifiedSub = !!verifiedSub;

  const secureIsVerified = brand.isVerified && isActiveVerifiedSub;

  const respondedComplaintsCount = await prisma.complaint.count({
    where: {
      brandId: id,
      followups: { some: { user: { role: "BRAND" } } },
    },
  });
  const responseRate =
    totalComplaints > 0
      ? (respondedComplaintsCount / totalComplaints) * 100
      : 0;

  // 3. Fetch paginated/filtered complaints
  const complaintsWhere: any = { brandId: id };
  if (stars && stars.length > 0) {
    complaintsWhere.ratings = { some: { stars: { in: stars } } };
  }
  if (search) {
    complaintsWhere.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }
  if (replied !== undefined) {
    if (replied) {
      complaintsWhere.followups = {
        some: { user: { role: { in: ["BRAND", "ADMIN"] } } },
      };
    } else {
      complaintsWhere.followups = {
        none: { user: { role: { in: ["BRAND", "ADMIN"] } } },
      };
    }
  }
  if (verified) {
    complaintsWhere.verifiedTier = { lt: 3 };
  }

  const [complaints, filteredTotal] = await Promise.all([
    prisma.complaint.findMany({
      where: complaintsWhere,
      skip,
      take: limit,
      orderBy: { [sortBy]: "desc" },
      include: {
        user: { select: { name: true } },
        ratings: true,
        followups: {
          include: {
            user: { select: { name: true, role: true } },
          },
        },
      },
    }),
    prisma.complaint.count({ where: complaintsWhere }),
  ]);

  return {
    ...brand,
    isVerified: secureIsVerified,
    stats: {
      averageRating: trustScore,
      arithmeticAverage: averageRating,
      totalRatings,
      totalComplaints,
      ratingDistribution: ratingDistribution.reverse(), // 5 to 1 for UI
      responseRate,
    },
    complaints,
    pagination: {
      total: filteredTotal,
      page,
      limit,
      totalPages: Math.ceil(filteredTotal / limit),
    },
  };
}

export async function processBrandClaim(
  claimId: string,
  status: "APPROVED" | "REJECTED" | "INFO_REQUESTED",
) {
  const claim = await prisma.brandClaim.findUnique({
    where: { id: claimId },
  });

  if (!claim) throw new Error("Brand claim not found");

  const updatedClaim = await prisma.brandClaim.update({
    where: { id: claimId },
    data: { status },
  });

  if (status === "APPROVED") {
    // When a claim is approved:
    // 1. Ensure the brand exists, is verified, and linked to the user
    let domainHint: string | undefined = undefined;

    if ((claim as any).websiteUrl) {
      try {
        const url = new URL(
          (claim as any).websiteUrl.startsWith("http")
            ? (claim as any).websiteUrl
            : `https://${(claim as any).websiteUrl}`,
        );
        domainHint = url.hostname.replace(/^www\./, "");
      } catch (e) {
        domainHint = (claim as any).websiteUrl;
      }
    } else {
      const emailDomain = claim.email.split("@")[1]?.toLowerCase();
      // Only hint if it's NOT a personal domain
      const { personalDomains } = await import("../../utils/email.utils.js");
      if (emailDomain && !personalDomains.includes(emailDomain)) {
        domainHint = emailDomain;
      }
    }

    await resolveBrand(
      claim.brandName,
      true,
      undefined,
      claim.userId,
      domainHint,
    );

    // 2. Promote user to BRAND role
    await prisma.user.update({
      where: { id: claim.userId },
      data: { role: "BRAND" as any },
    });
  }

  return updatedClaim;
}
