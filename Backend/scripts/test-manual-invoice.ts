import prisma from "../src/lib/prisma.js";
import { EmailTemplates } from "../src/services/email/emailTemplates.js";
import { EmailOutboxService } from "../src/services/emailOutbox.service.js";

async function main() {
  console.log("💰 Starting Manual Invoice Test...");

  // 1. Get or Create a Brand
  let brand = await prisma.brand.findFirst({
    include: { manager: true },
  });

  if (!brand) {
    console.log("No brand found, checking for user to create one...");
    const user = await prisma.user.findFirst();
    if (!user) {
      console.error("❌ No users found. Please run seed first.");
      process.exit(1);
    }
    brand = await prisma.brand.create({
      data: {
        name: "Test Corp " + Date.now(),
        managerId: user.id,
      },
      include: { manager: true },
    });
    console.log(`Created test brand: ${brand.name}`);
  } else {
    console.log(`Using existing brand: ${brand.name}`);
  }

  // 2. Create Billing Profile (Required for "Real" look, but model is optional? Let's create it)
  // Check if profile exists
  const profile = await prisma.billingProfile.upsert({
    where: { brandId: brand.id },
    create: {
      brandId: brand.id,
      companyName: brand.name + " Ltd",
      billingEmail: brand.manager?.email || "billing@example.com",
      addressLine1: "123 Innovation Drive",
      city: "Cape Town",
      country: "South Africa",
      postalCode: "8001",
    },
    update: {},
  });
  console.log("✅ Billing Profile verified.");

  // 3. Create Ad-Hoc Invoice
  const amount = 1500000; // R15,000.00
  const invoice = await prisma.invoice.create({
    data: {
      brandId: brand.id,
      invoiceNumber: `INV-MANUAL-${Date.now()}`,
      status: "ISSUED", // Standard status
      issuedAt: new Date(),
      subtotal: 1304348, // Excluding VAT
      vatAmount: 195652, // 15% VAT
      total: amount,
      currency: "ZAR",
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 Days
      // No subscriptionId!
      items: {
        create: [
          {
            description: "Enterprise Verification Audit (One-off)",
            quantity: 1,
            unitPrice: amount,
            amount: amount,
          },
        ],
      },
    },
    include: { items: true },
  });

  console.log(`✅ Invoice Created: ${invoice.invoiceNumber}`);
  console.log(`   Total: R${invoice.total / 100}`);
  console.log(`   Status: ${invoice.status}`);
  console.log(`   Items: ${invoice.items.length}`);

  // 4. Simulate Sending Email
  if (brand.manager?.email) {
    console.log(`📧 Sending invoice to ${brand.manager.email}...`);

    const emailContent = EmailTemplates.getInvoiceEmail({
      invoiceNumber: invoice.invoiceNumber,
      amount: invoice.total,
      currency: "ZAR",
      date: invoice.issuedAt,
      link: `http://localhost:3000/brand/settings/billing`,
    });

    await EmailOutboxService.enqueueEmail({
      brandId: brand.id,
      toEmail: brand.manager.email,
      subject: emailContent.subject,
      htmlBody: emailContent.htmlBody,
      textBody: emailContent.textBody,
    });
    console.log("✅ Email Enqueued.");
  } else {
    console.log("⚠️ Skipped email (No manager email found)");
  }
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
