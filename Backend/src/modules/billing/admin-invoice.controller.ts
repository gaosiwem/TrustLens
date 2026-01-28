import type { Request, Response } from "express";
import prisma from "../../lib/prisma.js";
import { EmailTemplates } from "../../services/email/emailTemplates.js";
import { EmailOutboxService } from "../../services/emailOutbox.service.js";
import { InvoicePDFService } from "../../services/billing/invoice-pdf.service.js";

export async function getAllInvoices(req: Request, res: Response) {
  try {
    const invoices = await prisma.invoice.findMany({
      include: {
        brand: {
          select: {
            id: true,
            name: true,
            manager: { select: { email: true } },
          },
        },
        items: true,
      },
      orderBy: { issuedAt: "desc" },
    });
    res.json(invoices);
  } catch (error) {
    console.error("Error fetching invoices:", error);
    res.status(500).json({ error: "Failed to fetch invoices" });
  }
}

export async function createAdHocInvoice(req: Request, res: Response) {
  try {
    const { brandId, items, dueDate } = req.body;
    // items: [{ description, quantity, unitPrice }]

    if (!brandId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Calculate totals
    let subtotal = 0;
    const invoiceItems = items.map((item: any) => {
      const amount = item.quantity * item.unitPrice;
      subtotal += amount;
      return {
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        amount,
      };
    });

    const vatRate = 0.15;
    const vatAmount = Math.round(subtotal * vatRate);
    const total = subtotal + vatAmount;

    // Create Invoice
    const invoice = await prisma.invoice.create({
      data: {
        brandId,
        invoiceNumber: `INV-${Date.now().toString().slice(-6)}`, // Simple ID generation
        status: "ISSUED",
        issuedAt: new Date(),
        dueDate: dueDate
          ? new Date(dueDate)
          : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        subtotal,
        vatAmount,
        total,
        currency: "ZAR",
        items: {
          create: invoiceItems,
        },
      },
      include: {
        brand: { include: { manager: true } },
        items: true,
      },
    });

    // Generate PDF
    const pdfBuffer = await InvoicePDFService.generateInvoicePDF(invoice);

    // Send Email
    if (invoice.brand.manager?.email) {
      const emailContent = EmailTemplates.getInvoiceEmail({
        invoiceNumber: invoice.invoiceNumber,
        amount: invoice.total,
        currency: "ZAR",
        date: invoice.issuedAt,
        link: `${process.env.FRONTEND_URL}/brand/settings/billing`,
      });

      await EmailOutboxService.enqueueEmail({
        brandId: invoice.brand.id,
        toEmail: invoice.brand.manager.email,
        subject: emailContent.subject,
        htmlBody: emailContent.htmlBody,
        textBody: emailContent.textBody,
        attachments: [
          {
            filename: `Invoice-${invoice.invoiceNumber}.pdf`,
            content: pdfBuffer,
            encoding: "base64",
          },
        ],
      });
    }

    res.status(201).json(invoice);
  } catch (error) {
    console.error("Error creating invoice:", error);
    res.status(500).json({ error: "Failed to create invoice" });
  }
}

export async function updateInvoiceStatus(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { status } = req.body; // PAID, VOID

    if (!["PAID", "VOID", "ISSUED"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const updateData: any = { status };
    if (status === "PAID") {
      updateData.paidAt = new Date();
    }

    const invoice = await prisma.invoice.update({
      where: { id },
      data: updateData,
    });

    res.json(invoice);
  } catch (error) {
    console.error("Error updating invoice:", error);
    res.status(500).json({ error: "Failed to update invoice" });
  }
}

export async function getInvoicePreview(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        brand: { include: { manager: true } },
        items: true,
      },
    });

    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    const pdfBuffer = await InvoicePDFService.generateInvoicePDF(invoice);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="Invoice-${invoice.invoiceNumber}.pdf"`,
    );
    res.send(pdfBuffer);
  } catch (error) {
    console.error("Error generating invoice preview:", error);
    res.status(500).json({ error: "Failed to generate preview" });
  }
}

export async function resendInvoice(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        brand: { include: { manager: true } },
        items: true,
      },
    });

    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    if (!invoice.brand.manager?.email) {
      return res
        .status(400)
        .json({ error: "Brand manager has no email address" });
    }

    const pdfBuffer = await InvoicePDFService.generateInvoicePDF(invoice);

    const emailContent = EmailTemplates.getInvoiceEmail({
      invoiceNumber: invoice.invoiceNumber,
      amount: invoice.total,
      currency: "ZAR",
      date: invoice.issuedAt,
      link: `${process.env.FRONTEND_URL}/brand/settings/billing`,
    });

    await EmailOutboxService.enqueueEmail({
      brandId: invoice.brand.id,
      toEmail: invoice.brand.manager.email,
      subject: emailContent.subject,
      htmlBody: emailContent.htmlBody,
      textBody: emailContent.textBody,
      attachments: [
        {
          filename: `Invoice-${invoice.invoiceNumber}.pdf`,
          content: pdfBuffer,
          encoding: "base64",
        },
      ],
    });

    res.json({ message: "Invoice resent successfully" });
  } catch (error) {
    console.error("Error resending invoice:", error);
    res.status(500).json({ error: "Failed to resend invoice" });
  }
}
