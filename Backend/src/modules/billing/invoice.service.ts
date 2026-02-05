import prisma from "../../lib/prisma.js";
import { calculateVATFromGross } from "./vat.service.js";
import { generateInvoiceNumber } from "./invoice-number.service.js";
import { EmailOutboxService } from "../../services/emailOutbox.service.js";
import { EmailTemplates } from "../../services/email/emailTemplates.js";

/**
 * Issues a paid invoice for a subscription.
 * Triggered by verified payment webhooks.
 */
export async function issuePaidInvoice({
  brandId,
  subscriptionId,
  amountGross,
}: {
  brandId: string;
  subscriptionId: string;
  amountGross: number;
}) {
  const { subtotal, vat, total } = calculateVATFromGross(amountGross);

  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber: generateInvoiceNumber(),
      brandId,
      subscriptionId,
      subtotal,
      vatAmount: vat,
      total,
      status: "PAID",
      issuedAt: new Date(),
      paidAt: new Date(),
    },
  });

  // SEND RECEIPT EMAIL
  try {
    const brand = await prisma.brand.findUnique({
      where: { id: brandId },
      include: { manager: { select: { email: true } } },
    });

    if (brand && brand.manager && brand.manager.email) {
      const receiptEmail = EmailTemplates.getInvoiceEmail({
        invoiceNumber: invoice.invoiceNumber,
        amount: invoice.total, // in cents
        currency: "ZAR",
        date: invoice.paidAt!,
        link: `${process.env.FRONTEND_URL || "http://localhost:3000"}/brand/settings/billing`,
      });

      await EmailOutboxService.enqueueEmail({
        brandId,
        toEmail: brand.manager.email,
        subject: receiptEmail.subject,
        htmlBody: receiptEmail.htmlBody,
        textBody: receiptEmail.textBody,
        attachments: receiptEmail.attachments,
      });
    }
  } catch (err) {
    console.error("Failed to send receipt email:", err);
    // Don't fail the transaction
  }

  return invoice;
}
