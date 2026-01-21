"use client";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useBrandClaim } from "../hooks/useBrandClaim";
import { toast } from "sonner";
import Dropzone from "react-dropzone";
import InputField from "./InputField";
import Button from "./Button";

interface BrandClaimFormData {
  brandName: string;
  email: string;
  websiteUrl?: string;
  files?: File[];
}

export default function BrandClaimForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BrandClaimFormData>();
  const [aiScore, setAiScore] = useState<number | null>(null);
  const mutation = useBrandClaim();

  const selectedFiles = watch("files") || [];

  const onSubmit = async (data: BrandClaimFormData) => {
    try {
      const score = await mutation.mutateAsync(data);
      setAiScore(score);
      toast.success("Brand claim submitted successfully!");

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (e: any) {
      const errorMessage =
        e.response?.data?.error || "Error submitting brand claim.";
      toast.error(errorMessage);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-6 max-w-lg w-full p-8 bg-white dark:bg-[#1a2c34] rounded-[2.5rem] shadow-2xl border border-border"
    >
      <div className="text-center">
        <h1 className="text-3xl font-black tracking-tight text-[#111618] dark:text-white">
          Claim Your Brand
        </h1>
        <p className="text-[#637588] dark:text-[#93a2b7] text-sm mt-2 font-medium">
          Verify your ownership to manage your presence and respond to reviews.
        </p>
      </div>

      <div className="space-y-5">
        <InputField
          label="Brand Name"
          placeholder="e.g. Shoprite"
          icon={
            <span className="material-symbols-outlined text-lg">store</span>
          }
          {...register("brandName", { required: "Brand name is required" })}
          error={errors.brandName?.message}
        />

        <InputField
          label="Official Email"
          placeholder="admin@brand.com"
          type="email"
          icon={<span className="material-symbols-outlined text-lg">mail</span>}
          {...register("email", {
            required: "Valid email is required",
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: "Invalid email address",
            },
          })}
          error={errors.email?.message}
        />

        <InputField
          label="Official Website (Optional)"
          placeholder="e.g. www.brand.co.za"
          icon={
            <span className="material-symbols-outlined text-lg">language</span>
          }
          {...register("websiteUrl")}
          error={errors.websiteUrl?.message}
        />

        <div>
          <label className="text-[#111618] dark:text-white text-sm font-medium mb-1.5 block">
            Verification Documents
          </label>
          <Dropzone
            onDrop={(acceptedFiles) => setValue("files", acceptedFiles)}
            accept={{ "image/*": [], "application/pdf": [] }}
          >
            {({ getRootProps, getInputProps, isDragActive }) => (
              <div
                {...getRootProps()}
                className={`border-dashed border-2 rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${
                  isDragActive
                    ? "border-primary bg-primary/5 scale-[1.02] shadow-inner"
                    : "border-[#dce0e5] dark:border-[#2c3e46] hover:border-primary/50 bg-muted/20"
                }`}
              >
                <input {...getInputProps()} />
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-2xl text-primary">
                    cloud_upload
                  </span>
                </div>
                <p className="text-sm font-bold text-foreground/80">
                  {selectedFiles.length > 0
                    ? `${selectedFiles.length} file(s) selected`
                    : "Drag & drop verification files here"}
                </p>
                <p className="text-xs text-muted-foreground mt-2 font-medium">
                  PDF Documents or Clear Images (Max 10MB)
                </p>
              </div>
            )}
          </Dropzone>
          {selectedFiles.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {selectedFiles.map((f: File, i: number) => (
                <div
                  key={i}
                  className="px-3 py-1.5 bg-primary/10 rounded-lg text-[10px] font-bold text-primary flex items-center gap-2 animate-in fade-in"
                >
                  <span className="material-symbols-outlined text-[14px]">
                    description
                  </span>
                  {f.name}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Button
        type="submit"
        disabled={mutation.isPending}
        className="h-14 mt-4!"
      >
        {mutation.isPending
          ? "Processing Claim..."
          : "Submit Verification Claim"}
      </Button>

      {aiScore !== null && (
        <div className="mt-4 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30">
          <p className="text-sm font-bold text-blue-700 dark:text-blue-300 flex items-center gap-2">
            <span className="material-symbols-outlined text-base">
              auto_awesome
            </span>
            AI Verification Confidence: {aiScore}%
          </p>
        </div>
      )}
    </form>
  );
}
