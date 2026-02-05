import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, "../.env") });

async function main() {
  console.log("Starting Brand Invitation Email Test...");

  try {
    const { EmailTransport } =
      await import("../src/services/email/emailTransport.js");
    const { EmailTemplates } =
      await import("../src/services/email/emailTemplates.js");

    const recipient = "gaosiwem@gmail.com";

    // Test ONLY the new template
    console.log(`Sending Brand Invitation Email to ${recipient}...`);

    // Simulate data
    const brandName = "TechSolutions Inc.";
    const complaintId = "test-123";

    const email = EmailTemplates.getBrandInvitationEmail(
      brandName,
      complaintId,
    );

    console.log("Subject:", email.subject);
    console.log("Body Preview:", email.htmlBody.substring(0, 100));

    await EmailTransport.send({
      to: recipient,
      subject: email.subject,
      html: email.htmlBody,
      text: email.textBody,
      attachments: email.attachments,
    });

    console.log("✅ Brand Invitation Email sent successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Failed to send email:", error);
    process.exit(1);
  }
}

main();
