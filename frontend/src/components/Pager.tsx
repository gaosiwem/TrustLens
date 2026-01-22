"use client";

import React from "react";
import { Button } from "./ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PagerProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
}

export default function Pager({
  currentPage,
  totalPages,
  onPageChange,
  loading = false,
}: PagerProps) {
  if (totalPages <= 0) return null;

  const renderPageButtons = () => {
    const pages = [];
    const delta = 1; // Number of pages to show around current page

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        pages.push(
          <button
            key={i}
            onClick={() => onPageChange(i)}
            disabled={loading}
            className={`w-10 h-10 rounded-xl font-bold text-xs transition-all ${
              currentPage === i
                ? "bg-primary text-white shadow-lg shadow-primary/20"
                : "hover:bg-muted text-muted-foreground border border-transparent hover:border-border"
            }`}
          >
            {i}
          </button>,
        );
      } else if (
        i === currentPage - delta - 1 ||
        i === currentPage + delta + 1
      ) {
        pages.push(
          <span key={i} className="text-muted-foreground px-1">
            ...
          </span>,
        );
      }
    }
    return pages;
  };

  return (
    <div className="flex justify-center items-center gap-4 mt-8">
      <Button
        variant="outline"
        disabled={currentPage === 1 || loading}
        onClick={() => onPageChange(currentPage - 1)}
        className="rounded-xl font-bold border-2 h-10 w-10 p-0"
      >
        <ChevronLeft className="w-5 h-5" />
      </Button>

      <div className="flex items-center gap-2">{renderPageButtons()}</div>

      <Button
        variant="outline"
        disabled={currentPage === totalPages || loading}
        onClick={() => onPageChange(currentPage + 1)}
        className="rounded-xl font-bold border-2 h-10 w-10 p-0"
      >
        <ChevronRight className="w-5 h-5" />
      </Button>
    </div>
  );
}
