import { InvoicePDFService } from "../src/services/billing/invoice-pdf.service.js";
import fs from "fs";

async function testPdf() {
  const dummyInvoice = {
    invoiceNumber: "INV-TEST-001",
    issuedAt: new Date(),
    dueDate: new Date(Date.now() + 86400000 * 14),
    brand: {
      name: "Acme Corp",
      manager: { email: "manager@acme.com" },
    },
    items: [
      {
        description: "Consulting Services",
        quantity: 10,
        unitPrice: 85000,
        amount: 850000,
      },
      {
        description: "Hosting Fee",
        quantity: 1,
        unitPrice: 20000,
        amount: 20000,
      },
    ],
    subtotal: 870000,
    vatAmount: 130500,
    total: 1000500,
  };

  console.log("Generating PDF...");
  try {
    const buffer = await InvoicePDFService.generateInvoicePDF(
      dummyInvoice as any,
    );
    console.log(`PDF Generated. Size: ${buffer.length} bytes.`);
    fs.writeFileSync("test-invoice.pdf", buffer);
    console.log("Saved to test-invoice.pdf");
  } catch (error) {
    console.error("PDF Generation Failed:", error);
  }
}

testPdf();
