"use client";

import { Upload } from "lucide-react";
import { InputHTMLAttributes, forwardRef } from "react";

interface UploadFileProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const UploadFile = forwardRef<HTMLInputElement, UploadFileProps>(
  ({ label, ...props }, ref) => {
    return (
      <div className="space-y-2 text-left">
        {label && (
          <label className="text-sm font-bold text-foreground/80 lowercase italic ml-1">
            {label}
          </label>
        )}
        <div className="relative group">
          <input
            type="file"
            ref={ref}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            {...props}
          />
          <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-border rounded-2xl bg-muted/30 group-hover:border-primary/40 group-hover:bg-primary/5 transition-all outline-none">
            <Upload className="h-8 w-8 text-muted-foreground group-hover:text-primary mb-4 transition-colors" />
            <p className="text-sm font-black italic tracking-tighter text-muted-foreground group-hover:text-primary transition-colors">
              Click to upload or drag & drop
            </p>
            <p className="text-[10px] text-muted-foreground font-medium mt-1 tracking-widest">
              PDF, JPG, or PNG (Max. 10MB)
            </p>
          </div>
        </div>
      </div>
    );
  }
);

UploadFile.displayName = "UploadFile";
