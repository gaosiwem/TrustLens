import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, "../.env") });

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  // Dynamically import services after env vars are loaded
  const { EmailTransport } =
    await import("../src/services/email/emailTransport.js");
  const { EmailTemplates } =
    await import("../src/services/email/emailTemplates.js");

  // Wait time between emails to avoid spam/socket issues
  const DELAY = 3000;

  try {
    console.log("Starting comprehensive email test...");
    console.log("SMTP Host:", process.env.SMTP_HOST);
    const recipient = "gaosiwem@gmail.com";

    // 1. Welcome Email
    console.log(`\n1. Sending Welcome Email...`);
    const welcomeEmail = EmailTemplates.getWelcomeEmail(
      "Gaosiwem",
      "https://trustlens.com/verify?token=12345",
    );
    await EmailTransport.send({
      to: recipient,
      subject: welcomeEmail.subject,
      html: welcomeEmail.htmlBody,
      text: welcomeEmail.textBody,
      attachments: welcomeEmail.attachments,
    });
    console.log("Welcome Email sent!");
    await wait(DELAY);

    // 2. Password Reset
    console.log(`\n2. Sending Password Reset Email...`);
    const resetEmail = EmailTemplates.getPasswordResetEmail(
      "https://trustlens.com/reset-password?token=abcdef",
    );
    await EmailTransport.send({
      to: recipient,
      subject: resetEmail.subject,
      html: resetEmail.htmlBody,
      text: resetEmail.textBody,
      attachments: resetEmail.attachments,
    });
    console.log("Password Reset Email sent!");
    await wait(DELAY);

    // 3. Urgent Notification (Red)
    console.log(`\n3. Sending Urgent Notification...`);
    const urgentEmail = EmailTemplates.getNotificationEmail({
      type: "URGENCY_ALERT",
      title: "Negative Sentiment Detected",
      body: "We detected a sudden spike in negative sentiment for your brand. Immediate attention recommended.",
      link: "https://trustlens.com/dashboard/alerts/1",
    });
    await EmailTransport.send({
      to: recipient,
      subject: urgentEmail.subject,
      html: urgentEmail.htmlBody,
      text: urgentEmail.textBody,
      attachments: urgentEmail.attachments,
    });
    console.log("Urgent Notification sent!");
    await wait(DELAY);

    // 4. Resolved Notification (Green)
    console.log(`\n4. Sending Resolved Notification...`);
    const successEmail = EmailTemplates.getNotificationEmail({
      type: "STATUS_CHANGED",
      title: "Complaint Resolved",
      body: "The complaint #1234 has been successfully resolved and closed.",
      link: "https://trustlens.com/dashboard/complaints/1234",
    });
    await EmailTransport.send({
      to: recipient,
      subject: successEmail.subject,
      html: successEmail.htmlBody,
      text: successEmail.textBody,
      attachments: successEmail.attachments,
    });
    console.log("Resolved Notification sent!");
    await wait(DELAY);

    // 5. Standard Notification (Blue)
    console.log(`\n5. Sending Standard Notification...`);
    const standardEmail = EmailTemplates.getNotificationEmail({
      type: "SYSTEM_UPDATE",
      title: "Weekly Analytics Ready",
      body: "Your weekly brand analytics report is now available for viewing.",
      link: "https://trustlens.com/dashboard/analytics",
    });
    await EmailTransport.send({
      to: recipient,
      subject: standardEmail.subject,
      html: standardEmail.htmlBody,
      text: standardEmail.textBody,
      attachments: standardEmail.attachments,
    });
    console.log("Standard Notification sent!");
    await wait(DELAY);

    // 6. Brand Follow-up Notification (Brand receives this when consumer replies)
    console.log(`\n6. Sending Brand Follow-up Notification...`);
    const followUpEmail = EmailTemplates.getNotificationEmail({
      type: "NEW_CONSUMER_MESSAGE",
      title: "New Message from Consumer",
      body: "A consumer has sent a new message regarding complaint: Damaged Product upon arrival",
      link: "https://trustlens.com/brand/complaints/9876",
    });
    await EmailTransport.send({
      to: recipient,
      subject: followUpEmail.subject,
      html: followUpEmail.htmlBody,
      text: followUpEmail.textBody,
      attachments: followUpEmail.attachments,
    });
    console.log("Brand Follow-up Notification sent!");
    await wait(DELAY);

    // 7. Resolved with Feedback
    console.log(`\n7. Sending Resolved with Feedback Notification...`);
    const resolvedEmail = EmailTemplates.getNotificationEmail({
      type: "STATUS_CHANGED",
      title: "Complaint Resolved",
      body: "The complaint 'Refund Needed' has been marked as resolved by the customer.",
      link: "https://trustlens.com/dashboard/complaints/123",
      reviewRating: 5,
      reviewComment:
        "Thank you for the quick turnaround! Very helpful support team.",
    });
    await EmailTransport.send({
      to: recipient,
      subject: resolvedEmail.subject,
      html: resolvedEmail.htmlBody,
      text: resolvedEmail.textBody,
      attachments: resolvedEmail.attachments,
    });
    console.log("Resolved Notification sent!");
    await wait(DELAY);

    // 8. Brand Claim Created (Blue/Amber)
    console.log(`\n8. Sending Brand Claim Created Notification...`);
    const claimCreatedEmail = EmailTemplates.getNotificationEmail({
      type: "SYSTEM_UPDATE",
      title: "Brand Claim Application Received",
      body: "We have received your application to claim 'TechSolutions Inc.'. Our team will review your documents within 24-48 hours.",
      link: "https://trustlens.com/brand/claim/status",
    });
    await EmailTransport.send({
      to: recipient,
      subject: claimCreatedEmail.subject,
      html: claimCreatedEmail.htmlBody,
      text: claimCreatedEmail.textBody,
      attachments: claimCreatedEmail.attachments,
    });
    console.log("Brand Claim Created Notification sent!");
    await wait(DELAY);

    // 8. Brand Claim Approved (Green)
    console.log(`\n8. Sending Brand Claim Approved Notification...`);
    const claimApprovedEmail = EmailTemplates.getNotificationEmail({
      type: "STATUS_CHANGED", // Will trigger Green badge due to "Approved" in title
      title: "Brand Claim Approved!",
      body: "Congratulations! Your claim for 'TechSolutions Inc.' has been verified and approved. You now have full access to brand management tools.",
      link: "https://trustlens.com/brand/dashboard",
    });
    await EmailTransport.send({
      to: recipient,
      subject: claimApprovedEmail.subject,
      html: claimApprovedEmail.htmlBody,
      text: claimApprovedEmail.textBody,
      attachments: claimApprovedEmail.attachments,
    });
    console.log("Brand Claim Approved Notification sent!");
    await wait(DELAY);

    // 9. Brand Invitation (Unclaimed Brand)
    console.log(`\n9. Sending Brand Invitation Email...`);
    const invitationEmail = EmailTemplates.getBrandInvitationEmail(
      "TechSolutions Inc.",
      "12345",
    );
    await EmailTransport.send({
      to: recipient,
      subject: invitationEmail.subject,
      html: invitationEmail.htmlBody,
      text: invitationEmail.textBody,
      attachments: invitationEmail.attachments,
    });
    console.log("Brand Invitation Email sent!");

    // 10. Payment Receipt
    console.log(`\n10. Sending Payment Receipt Email...`);
    const receiptEmail = EmailTemplates.getInvoiceEmail({
      invoiceNumber: "INV-2024-001",
      amount: 49900,
      currency: "ZAR",
      date: new Date(),
      link: "http://localhost:3000/brand/billing/invoice/123",
    });
    await EmailTransport.send({
      to: recipient,
      subject: receiptEmail.subject,
      html: receiptEmail.htmlBody,
      text: receiptEmail.textBody,
      attachments: receiptEmail.attachments,
    });
    console.log("Payment Receipt Email sent!");

    console.log("\nAll 10 test emails sent successfully!");
  } catch (error) {
    console.error("Failed to send email:", error);
    process.exit(1);
  }
}

main();
