"use client";

import { FC } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import StatusBadge from "./StatusBadge";
import RatingForm from "./RatingForm";
import BrandLogo from "./BrandLogo";

export type Complaint = {
  id: string;
  brandName: string;
  brandLogoUrl?: string; // Added field
  description: string;
  status: string;
  aiSummary: string | null;
  rating?: { stars: number; comment: string | null } | number | null;
};

type Props = {
  complaints: Complaint[];
  fetchMore: () => void;
  hasMore?: boolean;
};

export const ComplaintList: FC<Props> = ({
  complaints,
  fetchMore,
  hasMore = true,
}) => (
  <InfiniteScroll
    dataLength={complaints.length}
    next={fetchMore}
    hasMore={hasMore}
    loader={<h4 className="text-center p-4 dark:text-gray-400">Loading...</h4>}
    endMessage={
      <p className="text-center p-4 text-gray-500">No more complaints.</p>
    }
  >
    {complaints.map((c) => (
      <div
        key={c.id}
        className="border rounded-xl p-4 mb-4 bg-white dark:bg-[#101d22] dark:border-gray-800 shadow-sm"
      >
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <BrandLogo
              brandName={c.brandName}
              brandLogoUrl={c.brandLogoUrl}
              className="w-12 h-12 rounded-lg object-contain bg-white border border-border"
            />
            <h3 className="font-semibold text-lg dark:text-gray-100">
              {c.brandName}
            </h3>
          </div>
          <StatusBadge status={c.status} />
        </div>
        <p className="text-gray-600 dark:text-gray-300">{c.description}</p>
        {c.aiSummary && (
          <p className="italic mt-2 text-sm text-gray-500 dark:text-gray-400">
            AI Summary: {c.aiSummary}
          </p>
        )}
        <RatingForm
          complaintId={c.id}
          initialRating={
            typeof c.rating === "number" ? c.rating : c.rating?.stars
          }
        />
      </div>
    ))}
  </InfiniteScroll>
);

export default ComplaintList;
