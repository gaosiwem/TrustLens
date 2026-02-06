"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import { useRouter } from "next/navigation";
import FileUpload from "../../../components/FileUpload";
import AiRewritePreview from "../../../components/AiRewritePreview";
import { Button } from "../../../components/ui/button";

const complaintSchema = z.object({
  brand: z.string().min(1, "Brand is required"),
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(10, "Please provide more details (min 10 chars)"),
  files: z.any().optional(),
});

type ComplaintFormValues = z.infer<typeof complaintSchema>;

export default function CreateComplaint() {
  const router = useRouter();
  const [aiRewrite, setAiRewrite] = useState<string | null>(null);
  const [originalDescription, setOriginalDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ComplaintFormValues>({
    resolver: zodResolver(complaintSchema),
  });

  const description = watch("description");

  const onSubmit = async (data: ComplaintFormValues) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("brandName", data.brand);
      formData.append("title", data.title);
      formData.append("description", data.description);

      if (data.files && data.files.length > 0) {
        for (let i = 0; i < data.files.length; i++) {
          formData.append("attachments", data.files[i]);
        }
      }

      const response = await axios.post("/api/complaints", formData, {
        headers: {
          // Let the browser set the boundary
        },
      });

      // Check if AI rewrite was returned
      if (response.data.aiSummary && !aiRewrite) {
        setOriginalDescription(data.description);
        setAiRewrite(response.data.aiSummary);
        setIsSubmitting(false);
      } else {
        // Success - navigate to dashboard
        router.push("/dashboard");
      }
    } catch (err: any) {
      console.error("Submission failed", err);
      alert(
        "Something went wrong while submitting your complaint. Please try again.",
      );
      setIsSubmitting(false);
    }
  };

  const acceptRewrite = () => {
    if (aiRewrite) {
      setValue("description", aiRewrite);
      setAiRewrite(null);
      setOriginalDescription("");
      router.push("/dashboard");
    }
  };

  const rejectRewrite = () => {
    setAiRewrite(null);
    setOriginalDescription("");
    router.push("/dashboard");
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold">Report an Incident</h2>
        <p className="text-muted-foreground mt-2">
          Your report helps build a safer marketplace. Our AI will help refine
          your submission.
        </p>
      </div>

      {aiRewrite ? (
        <AiRewritePreview
          original={originalDescription}
          rewrite={aiRewrite}
          onAccept={acceptRewrite}
          onReject={rejectRewrite}
        />
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold" htmlFor="brand">
              Brand Name
            </label>
            <input
              {...register("brand")}
              id="brand"
              placeholder="e.g. Amazon, Nike, Local Bakery..."
              className="w-full rounded-xl border border-border bg-background p-4 shadow-sm focus:ring-2 focus:ring-primary outline-none transition-all"
            />
            {errors.brand && (
              <p className="text-destructive text-xs font-medium">
                {errors.brand.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold" htmlFor="title">
              Subject
            </label>
            <input
              {...register("title")}
              id="title"
              placeholder="Brief summary of the issue"
              className="w-full rounded-xl border border-border bg-background p-4 shadow-sm focus:ring-2 focus:ring-primary outline-none transition-all"
            />
            {errors.title && (
              <p className="text-destructive text-xs font-medium">
                {errors.title.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold" htmlFor="description">
              What went wrong?
            </label>
            <textarea
              {...register("description")}
              id="description"
              placeholder="Describe the issue in detail. Our AI will help make your complaint more effective..."
              className="w-full rounded-xl border border-border bg-background p-4 min-h-[200px] shadow-sm focus:ring-2 focus:ring-primary outline-none transition-all"
            />
            {errors.description && (
              <p className="text-destructive text-xs font-medium">
                {errors.description.message}
              </p>
            )}
          </div>

          <FileUpload
            multiple={true}
            onChange={(files) => setValue("files", files)}
          />

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-6 text-lg font-bold rounded-xl shadow-lg transition-transform active:scale-[0.98]"
          >
            {isSubmitting ? "Processing with AI..." : "Submit & Get AI Review"}
          </Button>
        </form>
      )}
    </div>
  );
}
