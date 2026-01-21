"use client";

import { useForm } from "react-hook-form";
import { useState, FC } from "react";
import { FaStar } from "react-icons/fa";
import clsx from "clsx";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";

type Props = {
  complaintId: string;
  initialRating?: number | null;
  onSubmit?: (data: { stars: number; comment: string }) => void;
};

const RatingForm: FC<Props> = ({ complaintId, initialRating, onSubmit }) => {
  const { register, handleSubmit } = useForm<{ comment: string }>();
  const [rating, setRating] = useState(initialRating || 0);

  const handleFormSubmit = (data: { comment: string }) => {
    if (onSubmit) {
      onSubmit({ stars: rating, comment: data.comment });
    } else {
      console.log("Submit rating for", complaintId, { stars: rating, ...data });
    }
  };

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="mt-2 flex flex-col gap-2"
    >
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <FaStar
            key={i}
            size={18}
            className={clsx(
              "cursor-pointer transition-colors",
              i <= rating ? "text-yellow-400" : "text-gray-300"
            )}
            onClick={() => setRating(i)}
          />
        ))}
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
      >
        Submit Rating
      </Button>
    </form>
  );
};

export default RatingForm;
