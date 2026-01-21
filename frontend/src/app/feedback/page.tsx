"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import RatingStars from "../../components/RatingStars";
import { Button } from "../../components/ui/button";
import { useRouter } from "next/navigation";

export default function Feedback() {
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      rating: 0,
      comment: "",
    },
  });

  const rating = watch("rating");

  const onSubmit = async (data: any) => {
    console.log("Feedback submitted:", data);
    // In production: await axios.post('/api/feedback', data)

    setSubmitted(true);
    setTimeout(() => {
      router.push("/dashboard");
    }, 2000);
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-6 text-center">
        <div className="mb-6">
          <span className="material-symbols-outlined text-6xl text-green-600 dark:text-green-400">
            check_circle
          </span>
        </div>
        <h1 className="text-2xl font-bold mb-2">Thank You!</h1>
        <p className="text-muted-foreground">
          Your feedback helps us improve our service. Redirecting to
          dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-10 px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Give Feedback</h1>
        <p className="text-muted-foreground mt-2">
          Help us improve by sharing your experience
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="p-6 rounded-2xl border border-border bg-card">
          <label className="block text-sm font-semibold mb-3">
            How would you rate your experience?
          </label>
          <div className="flex justify-center">
            <RatingStars
              max={5}
              initialRating={rating}
              onChange={(value) => setValue("rating", value)}
            />
          </div>
          {!rating && (
            <p className="text-xs text-destructive mt-2 text-center">
              Please select a rating
            </p>
          )}
        </div>

        <div>
          <label htmlFor="comment" className="block text-sm font-semibold mb-2">
            Additional Comments (Optional)
          </label>
          <textarea
            id="comment"
            {...register("comment")}
            placeholder="Tell us more about your experience..."
            className="w-full rounded-xl border border-border bg-background p-4 min-h-[150px] resize-none focus:ring-2 focus:ring-primary outline-none"
          />
          <p className="text-xs text-muted-foreground mt-2">
            Your feedback will be reviewed by our team
          </p>
        </div>

        <div className="flex gap-3 justify-end">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={!rating} className="px-8">
            Submit Feedback
          </Button>
        </div>
      </form>
    </div>
  );
}
