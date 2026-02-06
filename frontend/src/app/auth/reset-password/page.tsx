"use client";

import InputField from "@/components/InputField";
import Button from "@/components/Button";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import Link from "next/link";

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetPasswordData = z.infer<typeof resetPasswordSchema>;

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordData) => {
    if (!token) {
      toast.error("Invalid or expired reset link. Please request a new one.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, newPassword: data.password }),
        },
      );

      const result = await response.json();

      if (response.ok) {
        toast.success("Password reset successfully! Redirecting...");
        setTimeout(() => router.push("/auth/login"), 2000);
      } else {
        toast.error("Failed to reset password. Please try again.");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold text-red-500 mb-4">Invalid Link</h1>
        <p className="text-gray-600 mb-6">
          This password reset link is invalid or has expired.
        </p>
        <Link href="/auth/forgot-password">
          <Button>Request New Link</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-8 max-w-md w-full bg-white dark:bg-[#1a2c34] rounded-2xl shadow-xl border border-[#dce0e5] dark:border-[#2c3e46]">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-[#111618] dark:text-white">
          Reset Password
        </h1>
        <p className="text-[#637588] dark:text-[#93a2b7] text-sm mt-2">
          Enter your new password below.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div>
          <InputField
            label="New Password"
            type="password"
            icon={
              <span className="material-symbols-outlined text-lg">lock</span>
            }
            placeholder="••••••••"
            {...register("password")}
            error={errors.password?.message}
          />
        </div>

        <div>
          <InputField
            label="Confirm Password"
            type="password"
            icon={
              <span className="material-symbols-outlined text-lg">lock</span>
            }
            placeholder="••••••••"
            {...register("confirmPassword")}
            error={errors.confirmPassword?.message}
          />
        </div>

        <Button type="submit" disabled={loading}>
          {loading ? "Resetting..." : "Set New Password"}
        </Button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Suspense fallback={<div>Loading...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
