import prisma from "../../prismaClient.js";
import { calculateVATFromGross } from "./vat.service.js";
import { generateInvoiceNumber } from "./invoice-number.service.js";

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

  return prisma.invoice.create({
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
}
