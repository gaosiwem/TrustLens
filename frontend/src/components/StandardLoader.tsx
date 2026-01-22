"use client";

import clsx from "clsx";

interface StandardLoaderProps {
  fullPage?: boolean;
  className?: string;
}

export default function StandardLoader({
  fullPage = false,
  className,
}: StandardLoaderProps) {
  return (
    <div
      className={clsx(
        "flex flex-col items-center justify-center",
        fullPage ? "min-h-screen bg-background" : "flex-1 py-20",
        className,
      )}
    >
      <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />

      <p className="mt-6 text-[10px] font-black tracking-[0.3em] text-primary/60 uppercase">
        Loading Assets
      </p>
    </div>
  );
}
