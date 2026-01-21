"use client";
import InputField from "@/components/InputField";
import Button from "@/components/Button";
import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Mocking the reset link sending
    setTimeout(() => {
      setSubmitted(true);
      setLoading(false);
    }, 1500);
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
          <form onSubmit={handleReset} className="flex flex-col gap-4">
            <InputField
              label="Email Address"
              type="email"
              icon="mail"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button type="submit">
              {loading ? "Sending link..." : "Send Reset Link"}
            </Button>
          </form>
        ) : (
          <div className="flex flex-col gap-4 text-center">
            <p className="text-secondary font-medium">
              Please check your inbox at <strong>{email}</strong> and follow the
              instructions to reset your password.
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
