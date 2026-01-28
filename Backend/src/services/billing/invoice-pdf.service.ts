import PDFDocument from "pdfkit";
import path from "path";
import fs from "fs";

interface InvoiceData {
  invoiceNumber: string;
  issuedAt: Date;
  dueDate: Date | null;
  brand: {
    name: string;
    manager?: { email: string } | null;
  };
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
  }[];
  subtotal: number;
  vatAmount: number;
  total: number;
}

export class InvoicePDFService {
  static async generateInvoicePDF(invoice: InvoiceData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const buffers: Buffer[] = [];

      doc.on("data", (buffer) => buffers.push(buffer));
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", (err) => reject(err));

      const PRIMARY_COLOR = "#13B6EC";
      const TEXT_COLOR = "#333333";
      const LIGHT_TEXT_COLOR = "#555555";

      // --- Helper: Resolve Logo Path ---
      // Trying to locate the logo relative to the backend execution context.
      // Assuming Backend/ is the root, frontend is at ../frontend
      const logoPath = path.resolve(
        process.cwd(),
        "../frontend/public/logo.png",
      );

      // --- Header ---
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 50, 45, { width: 150 });
      }

      doc
        .fillColor(PRIMARY_COLOR)
        .fontSize(20)
        .text("INVOICE", 50, 50, { align: "right" }) // Aligned right, same Y as logo
        .moveDown();

      // Invoice Details
      doc
        .fillColor(TEXT_COLOR)
        .fontSize(10)
        .text(`Invoice #: ${invoice.invoiceNumber}`, { align: "right" })
        .text(`Date: ${invoice.issuedAt.toLocaleDateString("en-ZA")}`, {
          align: "right",
        });

      if (invoice.dueDate) {
        doc.text(`Due Date: ${invoice.dueDate.toLocaleDateString("en-ZA")}`, {
          align: "right",
        });
      }
      doc.moveDown();

      // --- Bill To ---
      const billToTop = 130;
      doc
        .text("Bill To:", 50, billToTop)
        .font("Helvetica-Bold")
        .text(invoice.brand.name, 50, billToTop + 15)
        .font("Helvetica")
        .fillColor(LIGHT_TEXT_COLOR)
        .text(invoice.brand.manager?.email || "", 50, billToTop + 30)
        .moveDown();

      // --- Table Header ---
      const tableTop = 200;

      // Header Background
      doc.rect(50, tableTop, 500, 25).fillColor(PRIMARY_COLOR).fill();

      // Header Text
      doc
        .fillColor("white")
        .font("Helvetica-Bold")
        .text("Description", 60, tableTop + 7)
        .text("Qty", 280, tableTop + 7, { width: 40, align: "right" })
        .text("Unit Price", 330, tableTop + 7, { width: 90, align: "right" })
        .text("Total", 430, tableTop + 7, { width: 90, align: "right" });

      // --- Items ---
      let y = tableTop + 35;
      doc.font("Helvetica").fillColor(TEXT_COLOR);

      invoice.items.forEach((item, i) => {
        // Zebra striping - optional, but nice. Let's keep it clean white for now or very light gray?
        // Let's stick to clean white for premium feel, maybe lines

        doc
          .text(item.description, 60, y)
          .text(item.quantity.toString(), 280, y, { width: 40, align: "right" })
          .text(`R ${(item.unitPrice / 100).toFixed(2)}`, 330, y, {
            width: 90,
            align: "right",
          })
          .text(`R ${(item.amount / 100).toFixed(2)}`, 430, y, {
            width: 90,
            align: "right",
          });

        y += 25;

        // Line separator
        doc
          .strokeColor("#E0E0E0")
          .moveTo(50, y - 5)
          .lineTo(550, y - 5)
          .stroke();
      });

      // --- Totals ---
      y += 10;

      const totalsXLabel = 330;
      const totalsXValue = 430;
      const totalsWidth = 90;

      doc
        .font("Helvetica-Bold")
        .text("Subtotal:", totalsXLabel, y, {
          width: totalsWidth,
          align: "right",
        })
        .text(`R ${(invoice.subtotal / 100).toFixed(2)}`, totalsXValue, y, {
          width: totalsWidth,
          align: "right",
        });

      y += 20;
      doc
        .text("VAT (15%):", totalsXLabel, y, {
          width: totalsWidth,
          align: "right",
        })
        .text(`R ${(invoice.vatAmount / 100).toFixed(2)}`, totalsXValue, y, {
          width: totalsWidth,
          align: "right",
        });

      y += 25;

      // Total Background Highlight
      doc
        .rect(totalsXLabel - 10, y - 5, 230, 25) // Extending background to right edge approx
        .fillColor(PRIMARY_COLOR)
        .fill();

      doc
        .fillColor("white")
        .fontSize(12)
        .text("Total:", totalsXLabel, y, { width: totalsWidth, align: "right" })
        .text(`R ${(invoice.total / 100).toFixed(2)}`, totalsXValue, y, {
          width: totalsWidth,
          align: "right",
        });

      // --- Footer ---
      doc
        .fillColor(LIGHT_TEXT_COLOR)
        .fontSize(10)
        .font("Helvetica")
        .text("Thank you for your business.", 50, 700, {
          align: "center",
          width: 500,
        });

      doc.end();
    });
  }
}
