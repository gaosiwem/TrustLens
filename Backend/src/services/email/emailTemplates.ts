export class EmailTemplates {
  private static getBaseTemplate(title: string, content: string): string {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <!--[if mso]>
        <noscript>
        <xml>
        <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
        </o:OfficeDocumentSettings>
        </xml>
        </noscript>
        <![endif]-->
        <style>
          /* Reset & Base Styles */
          body { 
            margin: 0; 
            padding: 0; 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; 
            background-color: #f8fafc; 
            color: #334155; 
            -webkit-font-smoothing: antialiased;
            font-size: 16px;
            line-height: 1.6;
          }
          
          table { border-collapse: collapse; width: 100%; }
          
          /* Container */
          .wrapper {
            width: 100%;
            table-layout: fixed;
            background-color: #f8fafc;
            padding-bottom: 40px;
          }
          
          .main-container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
            border: 1px solid #e2e8f0;
          }
          
          /* Header */
          .header {
            padding: 32px 40px;
            text-align: center;
            border-bottom: 1px solid #f1f5f9;
          }
          
          .logo-text {
            font-size: 26px;
            font-weight: 800;
            color: #0f172a;
            text-decoration: none;
            display: inline-block;
            letter-spacing: -0.5px;
          }
          
          .logo-dot {
            color: #13b6ec;
          }
          
          /* Content */
          .content {
            padding: 40px;
          }
          
          h1 {
            color: #0f172a;
            font-size: 24px;
            font-weight: 700;
            margin: 0 0 24px 0;
            line-height: 1.3;
            letter-spacing: -0.025em;
          }
          
          p {
            margin: 0 0 24px 0;
            color: #475569;
          }
          
          /* Buttons */
          .button-container {
            text-align: center;
            margin: 32px 0;
          }
          
          .button {
            background-color: #13b6ec;
            color: #ffffff !important;
            text-decoration: none;
            padding: 14px 32px;
            border-radius: 50px;
            font-weight: 600;
            font-size: 16px;
            display: inline-block;
            box-shadow: 0 4px 6px -1px rgba(19, 182, 236, 0.2);
            transition: all 0.2s ease;
          }
          
          /* Alerts/Badges */
          .badge {
            display: inline-block;
            padding: 6px 12px;
            border-radius: 6px;
            font-size: 13px;
            font-weight: 600;
            margin-bottom: 24px;
          }
          
          .bg-blue { background-color: #eff6ff; color: #1d4ed8; }
          .bg-green { background-color: #f0fdf4; color: #15803d; }
          .bg-red { background-color: #fef2f2; color: #b91c1c; }
          .bg-amber { background-color: #fffbeb; color: #b45309; }
          
          /* Footer */
          .footer {
            padding: 0 40px 32px;
            text-align: center;
            border-top: 1px solid #f1f5f9;
            padding-top: 32px;
          }
          
          .footer-text {
            font-size: 13px;
            color: #94a3b8;
            margin-bottom: 8px;
          }
          
          .footer-links a {
            color: #64748b;
            text-decoration: none;
            font-size: 13px;
            margin: 0 8px;
          }
          
          .footer-links a:hover {
            color: #13b6ec;
            text-decoration: underline;
          }
          
          /* Branding Accent */
          .accent-bar {
            height: 4px;
            background: linear-gradient(90deg, #13b6ec, #0891b2);
            width: 100%;
          }

          /* Mobile Responsive */
          @media only screen and (max-width: 620px) {
            .main-container { width: 100% !important; border-radius: 0 !important; border: none !important; }
            .header { padding: 24px !important; }
            .content { padding: 32px 24px !important; }
            .button { display: block !important; width: 100% !important; box-sizing: border-box !important; text-align: center !important; }
          }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div style="height: 40px;"></div>
          <!-- Main Card -->
          <div class="main-container">
            <!-- Top Accent -->
            <div class="accent-bar"></div>
            
            <!-- Header -->
            <div class="header">
              <a href="${process.env.FRONTEND_URL || "http://localhost:3000"}" class="logo-text">
                TrustLens<span class="logo-dot">.</span>
              </a>
            </div>
            
            <!-- Content -->
            <div class="content">
              ${content}
            </div>

            <!-- Footer -->
            <div class="footer">
              <p class="footer-text">&copy; ${new Date().getFullYear()} TrustLens. Building trust, one insight at a time.</p>
              <div class="footer-links">
                <a href="${process.env.FRONTEND_URL || "http://localhost:3000"}/settings">Preferences</a>
                &bull;
                <a href="${process.env.FRONTEND_URL || "http://localhost:3000"}/help">Help Center</a>
                &bull;
                <a href="${process.env.FRONTEND_URL || "http://localhost:3000"}/privacy">Privacy</a>
              </div>
            </div>
          </div>
          <div style="height: 40px;"></div>
        </div>
      </body>
      </html>
    `;
  }

  static getNotificationEmail(args: {
    type: string;
    title: string;
    body: string;
    link?: string;
    metadata?: any;
    reviewRating?: number;
    reviewComment?: string;
  }): { subject: string; htmlBody: string; textBody: string } {
    const isUrgent =
      args.type === "NEGATIVE_SENTIMENT" || args.type === "URGENCY_ALERT";
    const isSuccess =
      (args.type === "STATUS_CHANGED" || args.type === "SYSTEM_UPDATE") &&
      (args.title.includes("Resolved") ||
        args.title.includes("Approved") ||
        args.title.includes("Success"));

    let badgeClass = "bg-blue"; // Default
    let badgeText = "Notification";

    if (isUrgent) {
      badgeClass = "bg-red";
      badgeText = "Urgent Alert";
    } else if (isSuccess) {
      badgeClass = "bg-green";
      badgeText = "Success";
    } else if (args.type === "NEW_CONSUMER_MESSAGE") {
      badgeClass = "bg-blue";
      badgeText = "New Message";
    } else if (args.type === "SYSTEM_UPDATE") {
      badgeClass = "bg-amber";
      badgeText = "System Update";
    }

    // Generate Stars HTML if rating exists
    let starsHtml = "";
    if (args.reviewRating && args.reviewRating > 0) {
      const starCount = Math.min(Math.max(args.reviewRating, 1), 5); // Clamp 1-5
      starsHtml = `<div style="color: #fbbf24; font-size: 24px; margin-bottom: 16px;">${"★".repeat(starCount)}${"☆".repeat(5 - starCount)}</div>`;
    }

    // Generate Comment HTML if comment exists
    let commentHtml = "";
    if (args.reviewComment) {
      commentHtml = `
          <div style="background-color: #f8fafc; border-left: 4px solid #13b6ec; padding: 16px; margin: 24px 0; border-radius: 4px;">
            <p style="margin: 0; font-style: italic; color: #475569;">"${args.reviewComment}"</p>
          </div>
        `;
    }

    const htmlContent = `
      <div class="badge ${badgeClass}">${badgeText}</div>
      <h1>${args.title}</h1>
      <p style="color: #64748b; font-size: 15px; margin-bottom: 24px;">We wanted to keep you informed regarding recent activity on your account.</p>
      
      ${starsHtml}

      <p style="font-size: 16px; color: #334155;">${args.body}</p>
      
      ${commentHtml}

      ${
        args.link
          ? `
        <div class="button-container">
          <a href="${args.link}" class="button">View Details</a>
        </div>
        `
          : ""
      }
      
      <p style="font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 16px; margin-top: 32px;">
        Reference ID: <span style="font-family: monospace;">${args.type}</span>
      </p>
    `;

    // Add rating/comment to text body version as well
    let extraText = "";
    if (args.reviewRating)
      extraText += `\n\nRating: ${args.reviewRating}/5 Stars`;
    if (args.reviewComment) extraText += `\nComment: "${args.reviewComment}"`;

    return {
      subject: `[TrustLens] ${args.title}`,
      htmlBody: this.getBaseTemplate(args.title, htmlContent),
      textBody: `${args.title}\n\n${args.body}${extraText}\n\n${args.link ? `View details: ${args.link}` : ""}`,
    };
  }

  static getConsumerNotificationEmail(args: {
    type: string;
    title: string;
    body: string;
    link?: string;
  }): { subject: string; htmlBody: string; textBody: string } {
    let badgeClass = "bg-blue";
    let badgeText = "Update";

    if (args.type === "BRAND_RESPONSE") {
      badgeClass = "bg-blue";
      badgeText = "Brand Response";
    } else if (args.type === "STATUS_CHANGED") {
      badgeClass = "bg-green";
      badgeText = "Status Update";
    }

    const content = `
      <div class="badge ${badgeClass}">${badgeText}</div>
      <h1>${args.title}</h1>
      <p style="color: #64748b; font-size: 15px; margin-bottom: 24px;">There has been an update regarding your activity on TrustLens.</p>
      
      <p style="font-size: 16px; color: #334155; background-color: #f8fafc; padding: 16px; border-radius: 8px; border: 1px solid #e2e8f0;">${args.body}</p>

      ${
        args.link
          ? `
        <div class="button-container">
          <a href="${args.link}" class="button">View Update</a>
        </div>
        `
          : ""
      }
      
      <p style="font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 16px; margin-top: 32px;">
        Reference ID: <span style="font-family: monospace;">${args.type}</span>
      </p>
    `;

    return {
      subject: `[TrustLens] ${args.title}`,
      htmlBody: this.getBaseTemplate(args.title, content),
      textBody: `${args.title}\n\n${args.body}\n\n${args.link ? `View update: ${args.link}` : ""}`,
    };
  }

  static getWelcomeEmail(
    name: string,
    verifyLink: string,
  ): { subject: string; htmlBody: string; textBody: string } {
    const content = `
        <h1>Welcome to TrustLens, ${name}!</h1>
        <p>
            Welcome to a smarter way to manage trust. We are delighted to have you with us.
        </p>
        <p>
            TrustLens empowers you to build lasting relationships through transparent, data-driven reputation management. To activate your account and access your dashboard, please verify your email address below.
        </p>
        <div class="button-container">
          <a href="${verifyLink}" class="button">Verify My Email</a>
        </div>
        <p style="font-size: 14px; color: #94a3b8;">
            Link expires in 24 hours. If you didn't create an account, you can safely ignore this email.
        </p>
      `;

    return {
      subject: "Welcome to TrustLens! Please verify your email",
      htmlBody: this.getBaseTemplate("Welcome to TrustLens", content),
      textBody: `Welcome to TrustLens, ${name}!\n\nPlease verify your email: ${verifyLink}`,
    };
  }

  static getBrandInvitationEmail(
    brandName: string,
    complaintId: string,
  ): { subject: string; htmlBody: string; textBody: string } {
    const claimLink = `${process.env.FRONTEND_URL || "http://localhost:3000"}/brand/claim?brand=${encodeURIComponent(brandName)}`;
    const complaintLink = `${process.env.FRONTEND_URL || "http://localhost:3000"}/brand/complaints/${complaintId}`;

    const content = `
      <div class="badge bg-blue">Invitation to Connect</div>
      <h1>Your brand's reputation on TrustLens</h1>
      <p>
          We believe every story has two sides. A consumer has recently shared their experience with <strong>${brandName}</strong> on TrustLens, and we want to ensure your voice is heard too.
      </p>
      <p>
          TrustLens is an independent platform dedicated to transparent resolution. We are not here to amplify complaints, but to facilitate solutions. We stand for fair, open dialogue where brands can demonstrate their commitment to customer satisfaction.
      </p>
      <p>
          We invite you to view this feedback and share your perspective. This is your space to manage your narrative and build trust with your audience.
      </p>
      <p style="background-color: #f1f5f9; padding: 16px; border-radius: 8px; font-size: 14px; color: #475569; margin-bottom: 24px;">
          <strong>Good to know:</strong> Interacting with consumers and responding to feedback is free. You will never be charged to manage your brand's reputation on our core platform.
      </p>
      <div class="button-container">
        <a href="${complaintLink}" class="button">View Consumer Feedback</a>
      </div>
      <p style="text-align: center; margin-top: 16px;">
        <a href="${claimLink}" style="color: #13b6ec; text-decoration: none; font-size: 14px;">Claim this brand profile to manage your reputation</a>
      </p>
    `;

    return {
      subject: "Your brand's reputation on TrustLens: An invitation to connect",
      htmlBody: this.getBaseTemplate("Invitation to Connect", content),
      textBody: `Your brand's reputation on TrustLens: An invitation to connect\n\nWe believe every story has two sides. A consumer has recently shared their experience with ${brandName} on TrustLens.\n\nView Consumer Feedback: ${complaintLink}\n\nClaim your profile: ${claimLink}\n\n(Interacting with consumers is free.)`,
    };
  }

  static getInvoiceEmail(args: {
    invoiceNumber: string;
    amount: number;
    currency: string;
    date: Date;
    link: string;
  }): { subject: string; htmlBody: string; textBody: string } {
    const formatter = new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: args.currency,
    });
    const formattedAmount = formatter.format(args.amount / 100); // Amount is in cents

    const content = `
      <div class="badge bg-green">Payment Successful</div>
      <h1>Receipt for your payment</h1>
      <p>
          Thank you for your business. We have received your payment for <strong>${formattedAmount}</strong>.
      </p>
      <table style="width: 100%; margin: 24px 0; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
        <tr style="background-color: #f8fafc;">
          <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-weight: 600; font-size: 14px; color: #64748b;">Invoice Number</td>
          <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-weight: 600; font-size: 14px; color: #0f172a; text-align: right;">${args.invoiceNumber}</td>
        </tr>
         <tr style="background-color: #ffffff;">
          <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-weight: 600; font-size: 14px; color: #64748b;">Date</td>
          <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 14px; color: #334155; text-align: right;">${args.date.toLocaleDateString("en-ZA")}</td>
        </tr>
        <tr style="background-color: #f8fafc;">
          <td style="padding: 12px 16px; font-weight: 600; font-size: 14px; color: #64748b;">Total Amount</td>
          <td style="padding: 12px 16px; font-weight: 700; font-size: 16px; color: #13b6ec; text-align: right;">${formattedAmount}</td>
        </tr>
      </table>
      <div class="button-container">
        <a href="${args.link}" class="button">Download Invoice</a>
      </div>
      <p style="font-size: 14px; color: #94a3b8; text-align: center;">
         If you have any questions about this invoice, please contact support.
      </p>
    `;

    return {
      subject: `Payment Receipt: ${args.invoiceNumber}`,
      htmlBody: this.getBaseTemplate("Payment Receipt", content),
      textBody: `Payment Receipt: ${args.invoiceNumber}\n\nAmount: ${formattedAmount}\nDate: ${args.date.toLocaleDateString()}\n\nDownload: ${args.link}`,
    };
  }

  static getPasswordResetEmail(resetLink: string): {
    subject: string;
    htmlBody: string;
    textBody: string;
  } {
    const content = `
      <h1>Reset Your Password</h1>
      <p>
          We received a request to update the password for your TrustLens account. Your security is our priority.
      </p>
      <p>
          If this was you, please click the button below to securely set a new password. No changes have been made to your account yet.
      </p>
      <div class="button-container">
        <a href="${resetLink}" class="button">Reset Password</a>
      </div>
      <p style="font-size: 14px; color: #94a3b8;">
          If you didn't ask to reset your password, you can safely ignore this email. This link will expire in 1 hour.
      </p>
    `;

    return {
      subject: "Reset your TrustLens password",
      htmlBody: this.getBaseTemplate("Reset Password", content),
      textBody: `Reset your TrustLens password\n\nClick here: ${resetLink}\n\nThis link expires in 1 hour.`,
    };
  }
}
