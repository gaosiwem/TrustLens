"use client";
import { useState } from "react";

interface RatingStarsProps {
  max?: number;
  initialRating?: number;
  onChange?: (value: number) => void;
  readOnly?: boolean;
  color?: string;
  size?: "xs" | "sm" | "md" | "lg";
}

export default function RatingStars({
  max = 5,
  initialRating = 0,
  onChange,
  readOnly = false,
  color,
  size = "md",
}: RatingStarsProps) {
  const [rating, setRating] = useState(initialRating);
  const [hover, setHover] = useState(0);

  const handleClick = (value: number) => {
    if (readOnly) return;
    setRating(value);
    onChange?.(value);
  };

  return (
    <div className="flex gap-1 items-center">
      {[...Array(max)].map((_, i) => {
        const starValue = i + 1;
        const isFilled = starValue <= (hover || rating);

        return (
          <button
            key={i}
            type="button"
            onClick={() => handleClick(starValue)}
            onMouseEnter={() => !readOnly && setHover(starValue)}
            onMouseLeave={() => !readOnly && setHover(0)}
            disabled={readOnly}
            className={`${
              size === "xs"
                ? "text-[10px]"
                : size === "sm"
                  ? "text-base"
                  : size === "lg"
                    ? "text-2xl"
                    : "text-xl"
            } transition-colors ${
              readOnly ? "cursor-default" : "cursor-pointer hover:scale-110"
            }`}
          >
            <span
              className={`material-symbols-outlined ${
                isFilled
                  ? color
                    ? ""
                    : "text-yellow-400"
                  : "text-gray-300 dark:text-gray-600"
              }`}
              style={{
                fontVariationSettings: "'FILL' 1",
                color: isFilled && color ? color : undefined,
              }}
            >
              star
            </span>
          </button>
        );
      })}
    </div>
  );
}
