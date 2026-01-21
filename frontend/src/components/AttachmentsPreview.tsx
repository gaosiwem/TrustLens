"use client";

interface AttachmentsPreviewProps {
  files: string[];
}

export function AttachmentsPreview({ files }: AttachmentsPreviewProps) {
  if (!files || files.length === 0) {
    return null;
  }

  return (
    <div className="mt-4">
      <h4 className="text-sm font-semibold mb-2 text-muted-foreground">
        Attachments
      </h4>
      <div className="flex flex-col gap-2">
        {files.map((file, i) => {
          const apiUrl =
            process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000";
          const imageUrl = file.startsWith("http")
            ? file
            : `${apiUrl}/uploads/${file}`;

          return (
            <a
              key={i}
              href={imageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-primary hover:underline group"
            >
              <span className="material-symbols-outlined text-base group-hover:scale-110 transition-transform">
                attachment
              </span>
              <span className="truncate max-w-[300px]">{file}</span>
            </a>
          );
        })}
      </div>
    </div>
  );
}

export default AttachmentsPreview;
