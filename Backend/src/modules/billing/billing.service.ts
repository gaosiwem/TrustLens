import crypto from "crypto";

export interface PayFastPayload {
  merchant_id: string;
  merchant_key: string;
  return_url: string;
  cancel_url: string;
  notify_url: string;
  name_first?: string;
  name_last?: string;
  email_address?: string | undefined;
  m_payment_id?: string;
  amount: string;
  item_name: string;
  item_description?: string;
  custom_str1?: string; // Brand ID
  custom_str2?: string; // Plan Code
  signature?: string;
}

export class BillingService {
  private merchantId = process.env.PAYFAST_MERCHANT_ID || "";
  private merchantKey = process.env.PAYFAST_MERCHANT_KEY || "";
  private passphrase = process.env.PAYFAST_PASSPHRASE || "";

  generatePayFastPayload(data: {
    brandId: string;
    planCode: string;
    planName: string;
    amount: number; // in cents
    returnUrl: string;
    cancelUrl: string;
    notifyUrl: string;
    userEmail?: string;
  }): PayFastPayload {
    const payload: PayFastPayload = {
      merchant_id: this.merchantId,
      merchant_key: this.merchantKey,
      return_url: data.returnUrl,
      cancel_url: data.cancelUrl,
      notify_url: data.notifyUrl,
      email_address: data.userEmail || undefined,
      amount: (data.amount / 100).toFixed(2),
      item_name: `TrustLens ${data.planName} Subscription`,
      custom_str1: data.brandId,
      custom_str2: data.planCode,
    };

    payload.signature = this.generateSignature(payload);
    return payload;
  }

  verifySignature(data: any, receivedSignature: string): boolean {
    const generated = this.generateSignature(data);
    return generated === receivedSignature;
  }

  private generateSignature(data: any): string {
    let pfOutput = "";
    const keys = Object.keys(data).filter((k) => k !== "signature");

    for (const key of keys) {
      const value = data[key];
      if (value !== undefined && value !== null && value !== "") {
        pfOutput += `${key}=${encodeURIComponent(String(value).trim()).replace(
          /%20/g,
          "+"
        )}&`;
      }
    }

    if (this.passphrase !== "") {
      pfOutput += `passphrase=${encodeURIComponent(
        this.passphrase.trim()
      ).replace(/%20/g, "+")}`;
    } else {
      pfOutput = pfOutput.substring(0, pfOutput.length - 1);
    }

    return crypto.createHash("md5").update(pfOutput).digest("hex");
  }
}

export const billingService = new BillingService();
