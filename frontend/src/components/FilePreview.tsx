"use client";
import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";

// Set worker for react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

interface FilePreviewProps {
  file: { url: string; type: string; name: string };
  isLocal?: boolean;
}

export default function FilePreview({ file, isLocal }: FilePreviewProps) {
  const [numPages, setNumPages] = useState<number | null>(null);

  const fileUrl = isLocal ? file.url : file.url; // In a real app, you'd handle remote/local differently if needed

  const isPdf = file.type?.toLowerCase().includes("pdf");

  if (isPdf) {
    return (
      <div className="w-32 h-40 border border-border p-2 rounded-lg overflow-hidden bg-white shadow-sm flex flex-col items-center">
        <div className="flex-1 overflow-auto w-full flex justify-center">
          <Document
            file={fileUrl}
            onLoadSuccess={({ numPages }) => setNumPages(numPages)}
            loading={<div className="text-[10px] p-4">Loading PDF...</div>}
            error={<div className="text-[10px] p-4 text-red-500">Error</div>}
          >
            <Page
              pageNumber={1}
              width={100}
              renderAnnotationLayer={false}
              renderTextLayer={false}
            />
          </Document>
        </div>
        <p
          className="text-[10px] text-center mt-1 truncate w-full px-1"
          title={file.name}
        >
          {file.name}
        </p>
      </div>
    );
  }

  return (
    <div className="w-32 h-40 border border-border p-2 rounded-lg bg-white shadow-sm flex flex-col items-center">
      <div className="flex-1 w-full overflow-hidden flex items-center justify-center">
        <img
          src={fileUrl}
          alt={file.name}
          className="w-full h-full object-contain rounded"
        />
      </div>
      <p
        className="text-[10px] text-center mt-1 truncate w-full px-1"
        title={file.name}
      >
        {file.name}
      </p>
    </div>
  );
}
