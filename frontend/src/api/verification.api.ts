import {
  VerificationSubscription,
  VerificationDocument,
} from "../types/verification";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const getHeaders = (token?: string) => ({
  "Content-Type": "application/json",
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

export const getVerificationStatus = async (
  token: string,
): Promise<VerificationSubscription> => {
  const res = await fetch(`${API_URL}/verified/status`, {
    headers: getHeaders(token),
  });
  if (!res.ok) throw new Error("Failed to fetch verification status");
  return res.json();
};

export const subscribeToVerification = async (
  token: string,
  planCode: string,
) => {
  const res = await fetch(`${API_URL}/subscriptions/checkout`, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify({ planCode }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to initiate subscription");
  }
  return res.json();
};

export const uploadVerificationDocument = async (
  token: string,
  type: string,
  file: File,
) => {
  console.log(`[Frontend API] Uploading document: ${type}`, file);
  const formData = new FormData();
  formData.append("type", type);
  formData.append("file", file);

  // Note: For FormData, we don't set Content-Type header manually
  const res = await fetch(`${API_URL}/verified/request`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to upload document");
  }
  return res.json();
};

export const getVerificationDocuments = async (
  token: string,
): Promise<VerificationDocument[]> => {
  const res = await fetch(`${API_URL}/verified/documents`, {
    headers: getHeaders(token),
  });
  if (!res.ok) throw new Error("Failed to fetch verification documents");
  return res.json();
};

export const getVerificationAnalytics = async (token: string): Promise<any> => {
  const res = await fetch(`${API_URL}/verified/analytics`, {
    headers: getHeaders(token),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    if (res.status === 400) {
      throw new Error(
        error.error || "Brand verification required for analytics",
      );
    }
    throw new Error(error.error || "Failed to fetch verification analytics");
  }
  return res.json();
};
