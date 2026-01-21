"use client";
import InputField from "@/components/InputField";
import Button from "@/components/Button";
import SocialLoginButton from "@/components/SocialLoginButton";
import { signIn } from "next-auth/react";
import { useState, Suspense } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useSearchParams } from "next/navigation";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

function LoginForm() {
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const registered = searchParams.get("registered");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
    await signIn("credentials", {
      email: data.email,
      password: data.password,
      callbackUrl,
    });
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-background">
      <div className="card-base max-w-md w-full flex flex-col gap-6">
        <div className="flex flex-col gap-2 text-center">
          <h1 className="heading-1 text-2xl sm:text-3xl">Welcome Back</h1>
          <p className="text-muted-foreground text-sm">
            Please enter your details to sign in
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-100 rounded-lg dark:bg-red-900/30 dark:text-red-400">
            {error === "CredentialsSignin"
              ? "Invalid email or password. Please try again."
              : "An error occurred during sign in."}
          </div>
        )}

        {/* Success Alert */}
        {registered && (
          <div className="p-3 text-sm text-green-600 bg-green-100 rounded-lg dark:bg-green-900/30 dark:text-green-400">
            Account created successfully! Please sign in.
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <InputField
            label="Email Address"
            type="email"
            icon={
              <span className="material-symbols-outlined text-lg">mail</span>
            }
            placeholder="name@example.com"
            {...register("email")}
            error={errors.email?.message}
          />
          <InputField
            label="Password"
            type="password"
            icon={
              <span className="material-symbols-outlined text-lg">lock</span>
            }
            placeholder="••••••••"
            {...register("password")}
            error={errors.password?.message}
          />

          <div className="flex justify-end">
            <Link
              href="/auth/forgot-password"
              className="text-primary hover:underline text-sm font-medium"
            >
              Forgot password?
            </Link>
          </div>

          <Button type="submit">{loading ? "Signing in..." : "Sign In"}</Button>
        </form>

        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <span className="relative px-3 bg-card text-sm text-muted-foreground">
            Or continue with
          </span>
        </div>

        <SocialLoginButton provider="google" />

        <p className="text-center text-[#637588] dark:text-[#93a2b7] text-sm">
          Don't have an account?{" "}
          <Link
            href="/auth/register"
            className="text-primary font-bold hover:underline"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          Loading...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
