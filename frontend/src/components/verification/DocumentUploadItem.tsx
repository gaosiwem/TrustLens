import { FileText, CheckCircle, XCircle, Clock, Upload } from "lucide-react";
import { VerificationDocument } from "../../types/verification";
import { cn } from "../../lib/utils";

interface Props {
  type: string;
  doc?: VerificationDocument;
  onUpload: (file: File) => void;
  loading?: boolean;
}

export default function DocumentUploadItem({
  type,
  doc,
  onUpload,
  loading,
}: Props) {
  const label = type.replace(/_/g, " ");

  const statusConfig = {
    pending: {
      icon: <Clock className="w-4 h-4 text-amber-500" />,
      text: "Under Review",
      bg: "bg-amber-500/5 border-amber-500/20 text-amber-600",
    },
    approved: {
      icon: <CheckCircle className="w-4 h-4 text-emerald-500" />,
      text: "Approved",
      bg: "bg-emerald-500/5 border-emerald-500/20 text-emerald-600",
    },
    rejected: {
      icon: <XCircle className="w-4 h-4 text-destructive" />,
      text: "Rejected",
      bg: "bg-destructive/5 border-destructive/20 text-destructive",
    },
    none: {
      icon: <Upload className="w-4 h-4 text-muted-foreground" />,
      text: "Not Uploaded",
      bg: "bg-muted/30 border-border text-muted-foreground",
    },
  };

  const status = doc?.status || "none";
  const config =
    statusConfig[status as keyof typeof statusConfig] || statusConfig.none;

  return (
    <div className="p-4 rounded-xl border border-border bg-card flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all hover:bg-muted/30">
      <div className="space-y-1 grow">
        <h4 className="text-sm font-semibold tracking-tight text-foreground flex items-center gap-2">
          {label}
          {loading && (
            <span className="animate-pulse text-primary text-[10px] bg-primary/10 px-1.5 py-0.5 rounded-full">
              Uploading...
            </span>
          )}
        </h4>
        <div
          className={cn(
            "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[10px] font-medium uppercase tracking-wider",
            config.bg,
          )}
        >
          {config.icon}
          {config.text}
        </div>
        {doc?.rejectionReason && (
          <p className="text-xs text-destructive mt-1.5 ">
            Reason: {doc.rejectionReason}
          </p>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
        {doc?.url && (
          <a
            href={doc.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 h-9 px-4 rounded-lg text-xs font-medium transition-all bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-input shadow-sm"
          >
            <FileText className="w-3.5 h-3.5" />
            View
          </a>
        )}
        <label
          className={cn(
            "flex-1 md:flex-none flex items-center justify-center gap-2 h-9 px-4 rounded-lg text-xs font-medium transition-all cursor-pointer shadow-sm",
            status === "approved"
              ? "bg-muted text-muted-foreground cursor-not-allowed"
              : "bg-primary text-primary-foreground hover:bg-primary/90",
          )}
        >
          <input
            type="file"
            className="hidden"
            disabled={status === "approved" || loading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onUpload(file);
            }}
          />
          <Upload className="w-3.5 h-3.5" />
          {status === "none" ? "Upload" : "Replace"}
        </label>
      </div>
    </div>
  );
}
