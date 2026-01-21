"use client";

import { useRef, useState } from "react";

interface FileUploadProps {
  onChange: (files: FileList | null) => void;
  multiple?: boolean;
  accept?: string;
}

export function FileUpload({
  onChange,
  multiple = false,
  accept = "image/*,.pdf",
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (fileList) {
      setFiles(Array.from(fileList));
      onChange(fileList);
    }
  };

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);

    // Create new FileList-like object
    const dt = new DataTransfer();
    newFiles.forEach((file) => dt.items.add(file));
    if (inputRef.current) {
      inputRef.current.files = dt.files;
    }
    onChange(dt.files);
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="block text-sm font-semibold">
        Attachments (Images/PDF)
      </label>
      <input
        type="file"
        ref={inputRef}
        accept={accept}
        multiple={multiple}
        onChange={handleChange}
        className="input-base w-full p-0 file:h-full file:mr-4 file:px-6 file:border-0 file:bg-primary file:text-white file:font-bold file:cursor-pointer hover:file:bg-primary/90 transition-all"
      />

      {files.length > 0 && (
        <div className="mt-2 space-y-2">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 rounded-lg bg-muted text-sm"
            >
              <span className="truncate flex-1">{file.name}</span>
              <span className="text-xs text-muted-foreground mx-2">
                {(file.size / 1024).toFixed(1)} KB
              </span>
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="text-destructive hover:bg-destructive/10 p-1 rounded"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <small className="text-xs text-muted-foreground">
        {multiple ? "Can upload multiple files" : "Single file only"} • Max 10MB
        per file
      </small>
    </div>
  );
}

export default FileUpload;
