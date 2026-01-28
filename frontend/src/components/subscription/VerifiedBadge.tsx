import { BadgeCheck, ShieldAlert } from "lucide-react";
import { cn } from "../../lib/utils";
import { useRouter } from "next/navigation";

interface Props {
  isVerified?: boolean;
  verifiedUntil?: string | null;
  className?: string;
  showDate?: boolean;
  brandId?: string;
}

export default function VerifiedBadge({
  isVerified = true,
  verifiedUntil,
  className,
  showDate = true,
}: Props) {
  const isExpired = verifiedUntil
    ? new Date(verifiedUntil) < new Date()
    : false;
  const effectiveVerified = isVerified && !isExpired;

  if (!effectiveVerified) {
    return null;
  }

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 cursor-pointer hover:bg-emerald-500/20 transition-colors",
        className,
      )}
      onClick={async (e) => {
        e.stopPropagation();
        if ((window as any).brandId) {
          try {
            await fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/analytics/brands/${(window as any).brandId}/badge-click`,
              { method: "POST" },
            );
          } catch (err) {
            console.error(err);
          }
        }
        window.location.href = "/verified-explained";
      }}
    >
      <BadgeCheck className="w-3.5 h-3.5" />
      <span className="text-[10px] font-black tracking-widest">Verified</span>
      {showDate && verifiedUntil && (
        <span className="text-[10px] opacity-60 font-bold border-l border-emerald-500/30 pl-1.5 ml-0.5">
          Until {new Date(verifiedUntil).toLocaleDateString()}
        </span>
      )}
    </div>
  );
}
