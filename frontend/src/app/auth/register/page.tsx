"use client";
import InputField from "@/components/InputField";
import Button from "@/components/Button";
import { signIn } from "next-auth/react";
import { useState, Suspense } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

const registerSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phone: z.string().optional(),
});

type RegisterFormData = z.infer<typeof registerSchema>;

function RegisterForm() {
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

      // 1. Register User
      await axios.post(`${apiUrl}/auth/register`, {
        email: data.email,
        password: data.password,
        name: data.name,
      });

      // 2. Sign In
      const result = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
        callbackUrl,
      });

      if (result?.error) {
        console.warn("Auto-login failed:", result.error);
        window.location.href = `/auth/login?registered=true&callbackUrl=${encodeURIComponent(
          callbackUrl,
        )}`;
        return;
      }

      // Redirect manually
      window.location.href = callbackUrl;
    } catch (error: any) {
      console.error("Registration failed:", error);
      toast.error(
        "Registration failed: " +
          (error.response?.data?.error || error.message),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="flex flex-col gap-6 p-8 max-w-md w-full bg-white dark:bg-[#1a2c34] rounded-2xl shadow-xl border border-[#dce0e5] dark:border-[#2c3e46]">
        <div className="flex flex-col gap-2 text-center">
          <h1 className="text-3xl font-bold text-[#111618] dark:text-white">
            Create Account
          </h1>
          <p className="text-[#637588] dark:text-[#93a2b7] text-sm">
            Join TrustLens to secure your future
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <InputField
            label="Full Name"
            type="text"
            icon={
              <span className="material-symbols-outlined text-lg">person</span>
            }
            placeholder="John Doe"
            {...register("name")}
            error={errors.name?.message}
          />
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
            placeholder="Minimum 8 characters"
            {...register("password")}
            error={errors.password?.message}
          />
          <InputField
            label="Phone Number"
            type="tel"
            icon={
              <span className="material-symbols-outlined text-lg">phone</span>
            }
            placeholder="+1 (555) 000-0000"
            {...register("phone")}
            error={errors.phone?.message}
          />

          <Button type="submit">
            {loading ? "Creating Account..." : "Sign Up"}
          </Button>
        </form>

        <p className="text-center text-[#637588] dark:text-[#93a2b7] text-sm">
          Already have an account?{" "}
          <Link
            href={`/auth/login${
              searchParams.get("callbackUrl")
                ? `?callbackUrl=${encodeURIComponent(
                    searchParams.get("callbackUrl") as string,
                  )}`
                : ""
            }`}
            className="text-primary font-bold hover:underline"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          Loading...
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
