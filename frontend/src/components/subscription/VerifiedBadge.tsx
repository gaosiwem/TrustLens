import { BadgeCheck, ShieldAlert } from "lucide-react";
import { cn } from "../../lib/utils";

interface Props {
  isVerified?: boolean;
  verifiedUntil?: string | null;
  className?: string;
  showDate?: boolean;
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
    return (
      <div
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted text-muted-foreground border border-border",
          className
        )}
      >
        <ShieldAlert className="w-3.5 h-3.5" />
        <span className="text-[10px] font-black tracking-widest">
          {isExpired ? "Expired" : "Not Verified"}
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
        className
      )}
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
