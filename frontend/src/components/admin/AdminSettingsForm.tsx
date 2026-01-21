"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const platformSettingsSchema = z.object({
  platformName: z
    .string()
    .min(3, "Platform name must be at least 3 characters"),
  adminEmail: z.string().email("Invalid email address"),
  supportEmail: z.string().email("Invalid email address").optional(),
  maxUploadSize: z
    .number()
    .min(1)
    .max(100, "Max upload size must be between 1-100 MB"),
  allowPublicRegistration: z.boolean(),
});

type PlatformSettingsForm = z.infer<typeof platformSettingsSchema>;

export function AdminSettingsForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PlatformSettingsForm>({
    resolver: zodResolver(platformSettingsSchema),
    defaultValues: {
      platformName: "TrustLens",
      adminEmail: "admin@trustlens.com",
      supportEmail: "support@trustlens.com",
      maxUploadSize: 10,
      allowPublicRegistration: true,
    },
  });

  const onSubmit = async (data: PlatformSettingsForm) => {
    console.log("Platform settings:", data);
    // TODO: Call API to save settings
    alert("Settings saved successfully!");
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-6 p-6 bg-card border border-border rounded-xl shadow-sm"
    >
      <div>
        <label
          htmlFor="platformName"
          className="block text-sm font-medium mb-2"
        >
          Platform Name
        </label>
        <input
          id="platformName"
          {...register("platformName")}
          className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
        />
        {errors.platformName && (
          <p className="text-red-500 text-xs mt-1">
            {errors.platformName.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="adminEmail" className="block text-sm font-medium mb-2">
          Admin Email
        </label>
        <input
          id="adminEmail"
          type="email"
          {...register("adminEmail")}
          className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
        />
        {errors.adminEmail && (
          <p className="text-red-500 text-xs mt-1">
            {errors.adminEmail.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="supportEmail"
          className="block text-sm font-medium mb-2"
        >
          Support Email (Optional)
        </label>
        <input
          id="supportEmail"
          type="email"
          {...register("supportEmail")}
          className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
        />
        {errors.supportEmail && (
          <p className="text-red-500 text-xs mt-1">
            {errors.supportEmail.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="maxUploadSize"
          className="block text-sm font-medium mb-2"
        >
          Max Upload Size (MB)
        </label>
        <input
          id="maxUploadSize"
          type="number"
          {...register("maxUploadSize", { valueAsNumber: true })}
          className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
        />
        {errors.maxUploadSize && (
          <p className="text-red-500 text-xs mt-1">
            {errors.maxUploadSize.message}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <input
          id="allowPublicRegistration"
          type="checkbox"
          {...register("allowPublicRegistration")}
          className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
        />
        <label
          htmlFor="allowPublicRegistration"
          className="text-sm font-medium"
        >
          Allow Public Registration
        </label>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold"
      >
        {isSubmitting ? "Saving..." : "Save Settings"}
      </button>
    </form>
  );
}
