"use client";
import InputField from "@/components/InputField";
import Button from "@/components/Button";
import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ForgotPasswordData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const email = watch("email");

  const onSubmit = async (data: ForgotPasswordData) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        },
      );

      // Always show success to prevent enumeration, unless actual error (e.g. 500)
      if (response.ok || response.status === 400) {
        setSubmitted(true);
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="flex flex-col gap-6 p-8 max-w-md w-full bg-white dark:bg-[#1a2c34] rounded-2xl shadow-xl border border-[#dce0e5] dark:border-[#2c3e46]">
        <div className="flex flex-col gap-2 text-center">
          <h1 className="text-3xl font-bold text-[#111618] dark:text-white">
            Reset Password
          </h1>
          <p className="text-[#637588] dark:text-[#93a2b7] text-sm">
            {submitted
              ? "We've sent a recovery link to your email"
              : "Enter your email to receive a password reset link"}
          </p>
        </div>

        {!submitted ? (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <div>
              <InputField
                label="Email Address"
                type="email"
                icon={
                  <span className="material-symbols-outlined text-lg">
                    mail
                  </span>
                }
                placeholder="name@example.com"
                {...register("email")}
                error={errors.email?.message}
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? "Sending link..." : "Send Reset Link"}
            </Button>
          </form>
        ) : (
          <div className="flex flex-col gap-4 text-center">
            <p className="text-secondary font-medium">
              If an account exists for <strong>{email}</strong>, you will
              receive password reset instructions shortly.
            </p>
            <Button onClick={() => setSubmitted(false)}>Resend Link</Button>
          </div>
        )}

        <p className="text-center text-[#637588] dark:text-[#93a2b7] text-sm">
          Return to{" "}
          <Link
            href="/auth/login"
            className="text-primary font-bold hover:underline"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
