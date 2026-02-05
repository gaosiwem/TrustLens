import PDFDocument from "pdfkit";
import path from "path";
import fs from "fs";
import type { RiskSignal } from "../../modules/trust/risk.service.js";

export async function generateRiskReportPDF(
  brand: any,
  signals: RiskSignal[],
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: "A4" });
    const buffers: Buffer[] = [];

    doc.on("data", (buffer) => buffers.push(buffer));
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", (err) => reject(err));

    const COLORS = {
      primary: "#13B6EC",
      danger: "#E53E3E",
      warning: "#DD6B20",
      success: "#38A169",
      bg: "#F7FAFC",
      text: "#2D3748",
    };

    // Header
    const logoPath = path.resolve(process.cwd(), "../frontend/public/logo.png");
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 50, 40, { height: 35 });
    }

    doc
      .fillColor(COLORS.primary)
      .fontSize(20)
      .font("Helvetica-Bold")
      .text("REPUTATION RISK ASSESSMENT", 200, 45, { align: "right" });
    doc
      .fontSize(10)
      .font("Helvetica")
      .fillColor("#718096")
      .text(
        `Generated for ${brand.name} • ${new Date().toLocaleDateString()}`,
        200,
        70,
        { align: "right" },
      );

    doc.moveDown(4);

    // Summary Box
    const maxMomentum = Math.max(...signals.map((s) => s.momentum));
    const overallRisk =
      maxMomentum > 75 ? "CRITICAL" : maxMomentum > 50 ? "HIGH" : "MODERATE";
    const riskColor = maxMomentum > 50 ? COLORS.danger : COLORS.warning;

    doc.rect(50, 120, 500, 80).fill(COLORS.bg);
    doc
      .fillColor(riskColor)
      .fontSize(14)
      .font("Helvetica-Bold")
      .text("OVERALL THREAT LEVEL:", 70, 140);
    doc.fontSize(24).text(overallRisk, 70, 160);

    doc
      .fillColor(COLORS.text)
      .fontSize(10)
      .font("Helvetica")
      .text("Detected Vectors", 400, 140);
    doc
      .fontSize(20)
      .font("Helvetica-Bold")
      .text(signals.length.toString(), 400, 160);

    doc.moveDown(5);

    // Signals List
    doc
      .fillColor(COLORS.text)
      .fontSize(16)
      .font("Helvetica-Bold")
      .text("Detected Threat Vectors", 50, 230);
    doc.moveDown();

    signals.forEach((signal, i) => {
      const y = doc.y;

      // Severity Indicator
      const sevColor =
        signal.severity === "CRITICAL"
          ? COLORS.danger
          : signal.severity === "HIGH"
            ? COLORS.danger
            : COLORS.warning;
      doc.rect(50, y, 5, 60).fill(sevColor);

      doc
        .fillColor(COLORS.text)
        .fontSize(12)
        .font("Helvetica-Bold")
        .text(signal.title, 70, y + 5);
      doc
        .fontSize(9)
        .font("Helvetica")
        .fillColor("#718096")
        .text(
          `MOMENTUM: ${signal.momentum}% • TYPE: ${signal.type}`,
          70,
          y + 22,
        );
      doc
        .fontSize(10)
        .font("Helvetica")
        .fillColor(COLORS.text)
        .text(signal.description, 70, y + 35, { width: 450 });

      doc.moveDown(2);
    });

    // Strategy
    doc.moveDown(2);
    doc.rect(50, doc.y, 500, 100).fill("#EBF8FF");
    doc
      .fillColor("#2B6CB0")
      .fontSize(12)
      .font("Helvetica-Bold")
      .text("STRATEGIC RECOMMENDATION", 70, doc.y + 15);
    doc
      .fontSize(10)
      .font("Helvetica")
      .text(
        "1. Accelerate response times for high-urgency complaints.",
        70,
        doc.y + 10,
      );
    doc.text(
      "2. Enable patterns of failure monitoring for team leads.",
      70,
      doc.y + 5,
    );
    doc.text(
      "3. Prioritize resolution for verified high-trust consumers.",
      70,
      doc.y + 5,
    );

    doc.end();
  });
}
