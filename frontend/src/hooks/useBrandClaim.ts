"use client";
import { useMutation } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import axios from "axios";

interface BrandClaimData {
  brandName: string;
  email: string;
  websiteUrl?: string;
  files?: File[];
}

export const useBrandClaim = () => {
  const { data: session } = useSession();

  return useMutation({
    mutationFn: async (data: BrandClaimData) => {
      const formData = new FormData();
      formData.append("brandName", data.brandName);
      formData.append("email", data.email);
      if (data.websiteUrl) formData.append("websiteUrl", data.websiteUrl);
      data.files?.forEach((file) => formData.append("files", file));

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000";
      const res = await axios.post(`${apiUrl}/brands/claim`, formData, {
        headers: {
          Authorization: `Bearer ${(session as any)?.accessToken}`,
        },
      });
      return res.data.aiScore;
    },
  });
};
