import PDFDocument from "pdfkit";
import path from "path";
import fs from "fs";
import type { AuditData } from "./audit.service.js";

export class AuditPdfService {
  static async generateAuditPDF(data: AuditData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50, size: "A4" });
      const buffers: Buffer[] = [];

      doc.on("data", (buffer) => buffers.push(buffer));
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", (err) => reject(err));

      // --- COLORS & STYLING (Premium Palette) ---
      const COLORS = {
        primary: "#13B6EC", // TrustLens Blue
        secondary: "#2D3748", // Dark Slate
        accent: "#F6AD55", // Warning/Orange
        success: "#48BB78", // Green
        textMain: "#1A202C",
        textLight: "#718096",
        bgLight: "#F7FAFC",
        border: "#E2E8F0",
      };

      const FONTS = {
        base: "Helvetica",
        bold: "Helvetica-Bold",
      };

      // --- HEADER ---
      // Logo
      const logoPath = path.resolve(
        process.cwd(),
        "../frontend/public/logo.png",
      );
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 50, 40, { height: 40 });
      } else {
        doc
          .fillColor(COLORS.primary)
          .fontSize(24)
          .font(FONTS.bold)
          .text("TrustLens", 50, 40);
      }

      // Report Title & Period
      doc
        .fillColor(COLORS.secondary)
        .fontSize(10)
        .font(FONTS.bold)
        .text("QUARTERLY BRAND HEALTH AUDIT", 300, 45, { align: "right" })
        .font(FONTS.base)
        .fillColor(COLORS.textLight)
        .text(
          `${data.period.start.toLocaleDateString("en-ZA")} - ${data.period.end.toLocaleDateString("en-ZA")}`,
          300,
          60,
          { align: "right" },
        );

      doc.moveDown(4);

      // --- BRAND HERO SECTION ---
      // Gray background box
      doc.rect(50, 100, 500, 70).fillColor(COLORS.bgLight).fill();

      // Brand Name
      doc
        .fillColor(COLORS.primary)
        .fontSize(20)
        .font(FONTS.bold)
        .text(data.brandDetails.name, 70, 115);

      // Brand Tier Badge
      const tierText = data.brandDetails.isVerified
        ? "VERIFIED BRAND"
        : "STANDARD";
      doc.fontSize(10).fillColor(COLORS.textLight).text(tierText, 70, 140);

      doc.moveDown(3);

      // --- EXECUTIVE SUMMARY (Metric Grid) ---
      const startY = 200;
      doc
        .fillColor(COLORS.secondary)
        .fontSize(14)
        .font(FONTS.bold)
        .text("Performance Overview", 50, startY);

      const drawMetric = (
        x: number,
        y: number,
        label: string,
        value: string,
        subtext: string,
        color: string = COLORS.textMain,
      ) => {
        // Card Box
        doc
          .roundedRect(x, y + 20, 150, 80, 5)
          .strokeColor(COLORS.border)
          .stroke();

        // Label
        doc
          .fillColor(COLORS.textLight)
          .fontSize(9)
          .font(FONTS.base)
          .text(label.toUpperCase(), x + 15, y + 35);

        // Value
        doc
          .fillColor(color)
          .fontSize(24)
          .font(FONTS.bold)
          .text(value, x + 15, y + 55);

        // Subtext (e.g., vs last quarter) - using simplified version for now
        doc
          .fillColor(COLORS.textLight)
          .fontSize(8)
          .font(FONTS.base)
          .text(subtext, x + 15, y + 85);
      };

      // Grid Row 1
      drawMetric(
        50,
        startY + 10,
        "Total Complaints",
        data.metrics.totalComplaints.toString(),
        "In selected period",
      );
      drawMetric(
        220,
        startY + 10,
        "Resolution Rate",
        `${Math.round(data.metrics.resolutionRate)}%`,
        "Of processed complaints",
        data.metrics.resolutionRate > 80
          ? COLORS.success
          : data.metrics.resolutionRate < 50
            ? COLORS.accent
            : COLORS.textMain,
      );
      drawMetric(
        390,
        startY + 10,
        "Avg Sentiment",
        data.metrics.avgSentimentScore.toFixed(1),
        "Scale: -1.0 to 1.0",
      );

      // Grid Row 2
      const row2Y = startY + 120;
      drawMetric(
        50,
        row2Y,
        "Response Speed",
        `${Math.round(data.metrics.avgResponseTimeHours)}h`,
        "Average time to respond",
      );

      doc.moveDown(12); // Push past grid

      // --- KEY INSIGHTS (Status Distribution) ---
      const detailsY = row2Y + 120;

      // Status Distribution Table
      doc
        .fontSize(14)
        .font(FONTS.bold)
        .fillColor(COLORS.secondary)
        .text("Complaint Status Breakdown", 50, detailsY);

      let catY = detailsY + 30;
      // Header
      doc.rect(50, catY, 500, 25).fillColor(COLORS.bgLight).fill();
      doc
        .fontSize(10)
        .fillColor(COLORS.secondary)
        .text("STATUS", 60, catY + 8);
      doc.text("VOLUME", 450, catY + 8, { align: "right" });

      catY += 25;
      data.statusDistribution.forEach((item) => {
        doc
          .moveTo(50, catY + 25)
          .lineTo(550, catY + 25)
          .strokeColor(COLORS.border)
          .stroke();
        doc
          .font(FONTS.base)
          .fillColor(COLORS.textMain)
          .text(item.status.replace("_", " "), 60, catY + 8);
        doc.text(item.count.toString(), 450, catY + 8, { align: "right" });
        catY += 25;
      });

      // --- FOOTER ---
      const footerY = 750;
      doc
        .moveTo(50, footerY)
        .lineTo(550, footerY)
        .strokeColor(COLORS.border)
        .stroke();

      doc
        .fillColor(COLORS.textLight)
        .fontSize(8)
        .text(
          "TrustLens Reputation Intelligence & Verification Service",
          50,
          footerY + 10,
          { align: "center", width: 500 },
        )
        .text(
          `Generated on ${new Date().toLocaleDateString()}`,
          50,
          footerY + 25,
          { align: "center", width: 500 },
        );

      doc.end();
    });
  }
}
