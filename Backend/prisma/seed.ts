import { PrismaClient, UserRole, ComplaintStatus } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("Start seeding production-ready dummy data...");

  // 1. Clear existing data
  console.log("Cleaning up database...");
  await prisma.paymentTransaction.deleteMany();
  await prisma.invoiceItem.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.brandSubscription.deleteMany();
  await prisma.subscriptionPlan.deleteMany();

  await prisma.followup.deleteMany();
  await prisma.rating.deleteMany();
  await prisma.complaintStatusHistory.deleteMany();
  await prisma.attachment.deleteMany();
  await prisma.escalationCase.deleteMany();
  await prisma.complaintSentimentSnapshot.deleteMany();
  await prisma.complaint.deleteMany();

  await prisma.reputationScore.deleteMany();

  await prisma.brandAlertPreference.deleteMany();
  await prisma.brandBillingProfile.deleteMany();
  await prisma.brandMember.deleteMany();
  await prisma.brandSLAConfig.deleteMany();
  await prisma.brandDailyMetrics.deleteMany();
  await prisma.widgetKey.deleteMany();
  await prisma.brandLocation.deleteMany();
  await prisma.verifiedSubscription.deleteMany();
  await prisma.verifiedRequest.deleteMany();
  await prisma.brandClaim.deleteMany();
  await prisma.brandSentimentDaily.deleteMany();
  await prisma.sentimentEvent.deleteMany();

  await prisma.brand.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.notificationPreference.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.mFA.deleteMany();
  await prisma.user.deleteMany();

  const hashedDefaultPassword = await bcrypt.hash("Password123!", 10);

  // 1.5. Seed Subscription Plans
  console.log("Seeding subscription plans...");
  await prisma.subscriptionPlan.createMany({
    data: [
      {
        code: "FREE",
        name: "Public Participation",
        monthlyPrice: 0,
        features: {
          alerts: false,
          aiInsights: false,
          sentimentTracking: false,
          brandAudit: false,
          customDescription: false,
          trustTrend: false,
          riskSignals: false,
          rootCauseAI: false,
          teamSLA: false,
          historicalBenchmarking: false,
          apiAccess: false,
          customLLM: false,
          maxTeamSeats: 1,
        },
      },
      {
        code: "PRO",
        name: "Professional Foresight",
        monthlyPrice: 49900, // R499.00
        features: {
          alerts: true,
          aiInsights: true,
          sentimentTracking: true,
          brandAudit: true,
          customDescription: true,
          trustTrend: false,
          riskSignals: false,
          rootCauseAI: false,
          teamSLA: false,
          historicalBenchmarking: false,
          apiAccess: false,
          customLLM: false,
          maxTeamSeats: 3,
        },
      },
      {
        code: "BUSINESS",
        name: "Reputation Intelligence",
        monthlyPrice: 149900, // R1499.00
        features: {
          alerts: true,
          aiInsights: true,
          sentimentTracking: true,
          brandAudit: true,
          customDescription: true,
          trustTrend: true,
          riskSignals: true,
          rootCauseAI: true,
          teamSLA: true,
          historicalBenchmarking: true,
          apiAccess: false,
          customLLM: false,
          maxTeamSeats: 10,
        },
      },
      {
        code: "VERIFIED",
        name: "Verified Brand",
        monthlyPrice: 50000,
        features: {
          verifiedBadge: true,
          badgeColor: "green",
          annualRevalidation: true,
          priorityQueue: true,
          disputeClarification: "fast",
          auditTrail: true,
          extendedVisibility: true,
        },
      },
      {
        code: "ENTERPRISE",
        name: "Enterprise Global",
        monthlyPrice: 999900, // Placeholder R9999.00
        features: {
          alerts: true,
          aiInsights: true,
          sentimentTracking: true,
          brandAudit: true,
          customDescription: true,
          trustTrend: true,
          riskSignals: true,
          rootCauseAI: true,
          teamSLA: true,
          historicalBenchmarking: true,
          apiAccess: true,
          customLLM: true,
          maxTeamSeats: 100,
        },
      },
    ],
  });
  console.log("Plans seeded.");

  // 2. Create Users
  const admin = await prisma.user.create({
    data: {
      email: "admin@trustlens.com",
      name: "System Administrator",
      password: hashedDefaultPassword,
      role: UserRole.ADMIN,
    },
  });

  const consumer1 = await prisma.user.create({
    data: {
      email: "john.doe@gmail.com",
      name: "John Doe",
      password: hashedDefaultPassword,
      role: UserRole.USER,
    },
  });

  const consumer2 = await prisma.user.create({
    data: {
      email: "sarah.smith@outlook.com",
      name: "Sarah Smith",
      password: hashedDefaultPassword,
      role: UserRole.USER,
    },
  });

  const consumer3 = await prisma.user.create({
    data: {
      email: "mike.jones@me.com",
      name: "Mike Jones",
      password: hashedDefaultPassword,
      role: UserRole.USER,
    },
  });

  // 3. Create Brands
  const brandsData = [
    {
      name: "Mit Mak Motors",
      logoUrl: "https://www.mitmakmotors.co.za/images/logo.png",
      isVerified: true,
      description:
        "Looking for the BEST EXPERIENCE in motoring and the commitment to always put your needs first, visit one of our 5 beautiful dealerships, with over 800+ vehicles in stock you’ll be sure to find your dream car.",
      websiteUrl: "www.mitmakmotors.co.za",
      supportEmail: "giselle@mitmakmotors.co.za",
      supportPhone: "0844049578",
      searchTags: [
        "mit mak motors",
        "car dealership",
        "pretoria",
        "used cars",
        "vehicle finance",
      ],
    },
    {
      name: "Checkers",
      logoUrl:
        "https://upload.wikimedia.org/wikipedia/en/thumb/8/87/Checkers_Logo.svg/1200px-Checkers_Logo.svg.png",
      isVerified: true,
      description:
        "Better and Better. Your favorite grocery retailer offering high quality food, appliances and household goods.",
      websiteUrl: "www.checkers.co.za",
      supportEmail: "customercare@checkers.co.za",
      supportPhone: "0800 01 07 09",
      searchTags: ["grocery", "retail", "sixty60", "fresh food", "supermarket"],
    },
    {
      name: "FNB",
      logoUrl:
        "https://upload.wikimedia.org/wikipedia/en/4/4b/First_National_Bank_Logo.png",
      isVerified: true,
      description:
        "First National Bank - How can we help you? Leading financial services provider in South Africa.",
      websiteUrl: "www.fnb.co.za",
      supportEmail: "care@fnb.co.za",
      supportPhone: "087 575 9404",
      searchTags: [
        "banking",
        "finance",
        "credit card",
        "personal loan",
        "digital banking",
      ],
    },
    {
      name: "Takealot",
      logoUrl:
        "https://upload.wikimedia.org/wikipedia/commons/4/42/Takealot_Logo.png",
      isVerified: true,
      description:
        "South Africa's largest online retailer. Shop for everything from cellphones to electronics.",
      websiteUrl: "www.takealot.com",
      supportEmail: "help@takealot.com",
      supportPhone: "087 362 8000",
      searchTags: [
        "online shopping",
        "ecommerce",
        "electronics",
        "delivery",
        "retail",
      ],
    },
    {
      name: "Vodacom",
      logoUrl:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Vodacom_Logo.svg/2560px-Vodacom_Logo.svg.png",
      isVerified: false,
      description:
        "South Africa's leading cellular network provider. Connecting you to the world.",
      websiteUrl: "www.vodacom.co.za",
      supportEmail: "customercare@vodacom.co.za",
      supportPhone: "082 135",
      searchTags: ["telecom", "cellular", "data", "fibre", "mobile"],
    },
  ];

  const createdBrands = [];
  for (const b of brandsData) {
    const brandManager = await prisma.user.create({
      data: {
        email: `manager@${b.name.toLowerCase().replace(/\s+/g, "")}.com`,
        name: `${b.name} Manager`,
        password: hashedDefaultPassword,
        role: UserRole.BRAND,
      },
    });

    const brand = await prisma.brand.create({
      data: {
        ...b,
        managerId: brandManager.id,
      },
    });
    createdBrands.push(brand);
  }

  // 4. Create Complaints and Ratings
  const complaintsData = [
    {
      brandIdx: 0, // Mit Mak Motors
      title: "Excellent service from start to finish",
      description:
        "Found the car I wanted online, visited the Pretoria campus and the team helped me through everything. Highly recommended!",
      status: ComplaintStatus.RESOLVED,
      stars: 5,
      comment: "Best experience I've had at a dealership.",
      aiSummary:
        "The customer had a seamless buying experience at the Pretoria dealership and highly recommends their services.",
      sentimentScore: 0.95,
      replied: true,
      replyContent:
        "Thank you John! We are so glad you found your dream car with us. See you for your first service!",
    },
    {
      brandIdx: 0,
      title: "Slight delay in paperwork",
      description:
        "Bought a used Audi. The car is great but the registration took two weeks longer than promised.",
      status: ComplaintStatus.RESOLVED,
      stars: 3,
      comment: "Car is good, paperwork was slow.",
      aiSummary:
        "The customer is satisfied with the vehicle quality but frustrated by delays in the registration process.",
      sentimentScore: 0.4,
      replied: true,
      replyContent:
        "Hi Sarah, we apologize for the backlog at the licensing department. We're glad the Audi is treating you well!",
    },
    {
      brandIdx: 1, // Checkers
      title: "Sixty60 delivered late and items missing",
      description:
        "Ordered groceries for a dinner party, the driver was an hour late and the salmon was missing.",
      status: ComplaintStatus.RESPONDED,
      stars: 2,
      comment: "Terrible experience with Sixty60 today.",
      aiSummary:
        "A delivery failure resulted in missing essential items and delayed service for a time-sensitive event.",
      sentimentScore: -0.6,
      replied: true,
      replyContent:
        "We are deeply sorry for the inconvenience. We've credited your account for the salmon and a voucher for your next shop.",
    },
    {
      brandIdx: 2, // FNB
      title: "App is constantly crashing",
      description:
        "Ever since the last update, the FNB app closes immediately after login. I can't pay my bills!",
      status: ComplaintStatus.UNDER_REVIEW,
      stars: 1,
      comment: "Fix the app!",
      aiSummary:
        "The customer is experiencing critical application failures preventing essential banking operations.",
      sentimentScore: -0.8,
      replied: false,
    },
    {
      brandIdx: 3, // Takealot
      title: "TV arrived cracked",
      description:
        "Ordered a 65 inch TV, when I unboxed it the screen was shattered. Courier just left it at my door.",
      status: ComplaintStatus.RESOLVED,
      stars: 1,
      comment: "Broken on arrival.",
      aiSummary:
        "The customer received a high-value fragile item in damaged condition due to poor handling/delivery.",
      sentimentScore: -0.9,
      replied: true,
      replyContent:
        "Hi Mike, we've arranged for the damaged TV to be picked up today and a replacement is being express shipped. Sorry for the frustration!",
    },
    {
      brandIdx: 3,
      title: "Fast delivery of my airfryer",
      description:
        "Ordered on Monday night, arrived Tuesday morning. Amazing service as always.",
      status: ComplaintStatus.RESOLVED,
      stars: 5,
      comment: "Always reliable.",
      aiSummary:
        "The customer is highly satisfied with the ultra-fast delivery turnaround time.",
      sentimentScore: 0.9,
      replied: false,
    },
  ];

  for (let i = 0; i < complaintsData.length; i++) {
    const c = complaintsData[i];
    const brand = createdBrands[c.brandIdx];
    const user = i % 2 === 0 ? consumer1 : consumer2;

    const complaint = await prisma.complaint.create({
      data: {
        title: c.title,
        description: c.description,
        status: c.status,
        userId: user.id,
        brandId: brand.id,
        aiSummary: c.aiSummary,
        sentimentScore: c.sentimentScore,
        verifiedTier: 1, // High trust for dummy data
      },
    });

    await prisma.rating.create({
      data: {
        stars: c.stars,
        comment: c.comment,
        userId: user.id,
        complaintId: complaint.id,
      },
    });

    if (c.replied) {
      await prisma.followup.create({
        data: {
          comment: c.replyContent || "We are looking into this.",
          userId: brand.managerId!,
          complaintId: complaint.id,
        },
      });
    }
  }

  // 5. Add some generic reviews to flesh out the list (Takealot & Checkers)
  const genericReviews = [
    {
      brandIdx: 1,
      stars: 4,
      title: "Good quality meat",
      desc: "The Butchery section at Checkers Sandton is always great.",
    },
    {
      brandIdx: 1,
      stars: 5,
      title: "Love the new store",
      desc: "The new Checkers Hyper is world class.",
    },
    {
      brandIdx: 3,
      stars: 4,
      title: "Great selection",
      desc: "Always find what I need on Takealot.",
    },
    {
      brandIdx: 3,
      stars: 5,
      title: "Top notch!",
      desc: "Best ecommerce in the country.",
    },
    {
      brandIdx: 0,
      stars: 5,
      title: "No complaints",
      desc: "Smooth process, happy with my car.",
    },
    {
      brandIdx: 0,
      stars: 4,
      title: "Friendly staff",
      desc: "The sales team was very helpful and not pushy.",
    },
  ];

  for (const r of genericReviews) {
    const brand = createdBrands[r.brandIdx];
    const complaint = await prisma.complaint.create({
      data: {
        title: r.title,
        description: r.desc,
        status: ComplaintStatus.RESOLVED,
        userId: consumer3.id,
        brandId: brand.id,
        verifiedTier: 2,
      },
    });
    await prisma.rating.create({
      data: {
        stars: r.stars,
        comment: r.title,
        userId: consumer3.id,
        complaintId: complaint.id,
      },
    });
  }

  console.log("Seeding finished successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
