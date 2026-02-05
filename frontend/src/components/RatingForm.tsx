import { useForm } from "react-hook-form";
import { useState, FC } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import RatingStars from "./RatingStars";

type Props = {
  complaintId: string;
  initialRating?: number | null;
  onSubmit?: (data: { stars: number; comment: string }) => void;
  brandName?: string;
  starColor?: string;
};

const RatingForm: FC<Props> = ({
  complaintId,
  initialRating,
  onSubmit,
  brandName,
  starColor,
}) => {
  const { register, handleSubmit } = useForm<{ comment: string }>();
  const [rating, setRating] = useState(initialRating || 0);
  const [submitted, setSubmitted] = useState(false);

  const handleFormSubmit = (data: { comment: string }) => {
    if (onSubmit) {
      onSubmit({ stars: rating, comment: data.comment });
    } else {
      console.log("Submit rating for", complaintId, { stars: rating, ...data });
    }
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="mt-4 flex flex-col gap-4 animate-in fade-in duration-300">
        <div className="p-4 bg-green-50 dark:bg-green-900/10 text-green-700 dark:text-green-400 rounded-lg text-sm font-medium text-center">
          Thank you for your feedback! Your rating has been submitted.
        </div>

        {brandName && (
          <div className="space-y-3">
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
              Want to help others? Share your experience on Google Reviews as
              well.
            </p>
            <Button
              className="w-full bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
              variant="outline"
              onClick={() => {
                const query = encodeURIComponent(`${brandName} reviews`);
                window.open(
                  `https://www.google.com/search?q=${query}`,
                  "_blank",
                );
              }}
            >
              <span className="mr-2">G</span> Post to Google Reviews
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="mt-2 flex flex-col gap-2"
    >
      <div className="flex items-center gap-1 mb-2">
        <RatingStars
          max={5}
          initialRating={rating}
          onChange={setRating}
          color={starColor}
          size="sm"
        />
      </div>

      <Textarea
        placeholder="Optional comment"
        className="w-full"
        {...register("comment")}
      />

      <Button
        type="submit"
        size="sm"
        className="bg-primary text-white w-full md:w-auto"
        disabled={rating === 0}
      >
        Submit Rating
      </Button>
    </form>
  );
};

export default RatingForm;
