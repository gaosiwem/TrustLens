import { EmailTemplates } from "../src/services/email/emailTemplates.js";
async function main() {
    console.log("Generating Notification Email...");
    const notificationEmail = EmailTemplates.getNotificationEmail({
        type: "COMPLAINT_CREATED",
        title: "New Complaint Received",
        body: "A new complaint has been filed against your brand.",
        link: "http://localhost:3000/dashboard/complaints/123",
    });
    console.log("Subject:", notificationEmail.subject);
    console.log("Text Body:", notificationEmail.textBody);
    console.log("HTML Body Preview:", notificationEmail.htmlBody.substring(0, 500) + "...");
    if (!notificationEmail.htmlBody.includes("New Complaint Received")) {
        throw new Error("HTML body missing title");
    }
    if (!notificationEmail.htmlBody.includes("background-color: #3b82f6")) {
        // Blue color check
        throw new Error("HTML body missing correct color style");
    }
    console.log("\nGenerating Urgent Notification Email...");
    const urgentEmail = EmailTemplates.getNotificationEmail({
        type: "URGENCY_ALERT",
        title: "Urgent Action Required",
        body: "A complaint has been escalated.",
        link: "http://localhost:3000/dashboard/complaints/456",
    });
    if (!urgentEmail.htmlBody.includes("background-color: #ef4444")) {
        // Red color check
        throw new Error("Urgent email missing red color style");
    }
    console.log("Urgent email color verification passed.");
    console.log("\nGenerating Welcome Email...");
    const welcomeEmail = EmailTemplates.getWelcomeEmail("John Doe", "http://localhost:3000/verify?token=abc");
    console.log("Welcome Subject:", welcomeEmail.subject);
    if (!welcomeEmail.htmlBody.includes("Welcome to TrustLens, John Doe")) {
        throw new Error("Welcome email missing name");
    }
    console.log("\nGenerating Password Reset Email...");
    const resetEmail = EmailTemplates.getPasswordResetEmail("http://localhost:3000/reset-password?token=xyz");
    console.log("Reset Subject:", resetEmail.subject);
    if (!resetEmail.htmlBody.includes("Reset Your Password")) {
        throw new Error("Reset email missing title");
    }
    if (!resetEmail.htmlBody.includes("Reset Password</a>")) {
        throw new Error("Reset email missing button");
    }
    console.log("\nAll template verifications passed!");
}
main().catch(console.error);
//# sourceMappingURL=test-email-templates.js.map