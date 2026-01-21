Sprint6-UI.md

# Sprint6-UI: Complaint AI Rewrite & Dashboard

## 1. FILE ARCHITECTURE

Frontend/
├── app/
│ ├── page.tsx
│ ├── auth/
│ │ ├── login.tsx
│ │ ├── register.tsx
│ │ ├── forgot-password.tsx
│ │ └── verify-email.tsx
│ ├── complaints/
│ │ ├── create.tsx
│ │ ├── list.tsx
│ │ ├── details.tsx
│ │ └── ai-rewrite-preview.tsx
│ ├── dashboard/
│ │ └── index.tsx
│ ├── components/
│ │ ├── file-upload.tsx
│ │ ├── toggle-dark.tsx
│ │ ├── pagination.tsx
│ │ └── rating-stars.tsx
│ └── lib/
│ └── api.ts
├── styles/
│ └── globals.css
└── package.json

2. DEPENDENCIES
   npm install react-hook-form react-query axios shadcn-ui @radix-ui/react-icons
   npm install tailwind-variants tailwindcss postcss autoprefixer
   npm install @tanstack/react-table @tanstack/react-query
   npm install next-auth bcryptjs

3. COMPLAINT CREATION PAGE

app/complaints/create.tsx

"use client";

import { useForm } from "react-hook-form";
import { useState } from "react";
import FileUpload from "../components/file-upload";
import axios from "axios";

type ComplaintForm = {
brand: string;
subject: string;
description: string;
attachments: File[];
};

export default function CreateComplaint() {
const { register, handleSubmit, formState: { errors } } = useForm<ComplaintForm>();
const [aiRewrite, setAiRewrite] = useState<string | null>(null);

const onSubmit = async (data: ComplaintForm) => {
const formData = new FormData();
formData.append("brand", data.brand);
formData.append("subject", data.subject);
formData.append("description", data.description);
data.attachments.forEach(file => formData.append("attachments", file));

    const response = await axios.post("/api/complaints", formData);
    setAiRewrite(response.data.aiRewrite);

};

return (

<div className="max-w-xl mx-auto p-4 flex flex-col gap-6">
<h1 className="text-2xl font-bold text-primary">Submit a Complaint</h1>
<form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
<input
{...register("brand", { required: true })}
placeholder="Brand Name"
className="input-field"
/>
<input
{...register("subject", { required: true })}
placeholder="Subject"
className="input-field"
/>
<textarea
{...register("description", { required: true })}
placeholder="Description"
className="input-field h-32"
/>
<FileUpload {...register("attachments")} multiple />
<button type="submit" className="btn-primary">Submit</button>
</form>

      {aiRewrite && (
        <div className="mt-4 p-4 border border-primary rounded-xl">
          <h2 className="font-semibold text-primary mb-2">AI Suggested Rewrite</h2>
          <p>{aiRewrite}</p>
        </div>
      )}
    </div>

);
}

Notes:

Uses React Hook Form for validation.

Handles multiple attachments (images and PDFs).

Displays AI rewrite in real-time once the backend responds.

4. FILE UPLOAD COMPONENT

app/components/file-upload.tsx

"use client";

import { useRef } from "react";

interface FileUploadProps {
multiple?: boolean;
}

export default function FileUpload({ multiple }: FileUploadProps) {
const inputRef = useRef<HTMLInputElement>(null);

return (

<div className="flex flex-col gap-2">
<label className="text-sm font-medium">Attachments (Images/PDF)</label>
<input
        type="file"
        ref={inputRef}
        accept="image/*,.pdf"
        multiple={multiple}
        className="input-field"
      />
</div>
);
}

5. COMPLAINT LIST WITH CURSOR PAGINATION

app/complaints/list.tsx

"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Pagination from "../components/pagination";

export default function ComplaintList() {
const { data, fetchNextPage } = useQuery({
queryKey: ["complaints"],
queryFn: async ({ pageParam = null }) => {
const res = await axios.get("/api/complaints", { params: { cursor: pageParam } });
return res.data;
},
getNextPageParam: (lastPage) => lastPage.nextCursor || undefined,
});

return (

<div className="max-w-xl mx-auto p-4 flex flex-col gap-4">
<h1 className="text-2xl font-bold text-primary">Your Complaints</h1>
{data?.pages.map(page =>
page.items.map(c => (
<div key={c.id} className="p-4 border rounded-xl">
<p><strong>Brand:</strong> {c.brand}</p>
<p><strong>Status:</strong> {c.status}</p>
<p>{c.subject}</p>
</div>
))
)}
<Pagination onLoadMore={() => fetchNextPage()} />
</div>
);
}

6. RATING COMPONENT

app/components/rating-stars.tsx

"use client";

import { useState } from "react";

interface RatingProps {
max?: number;
onChange?: (value: number) => void;
}

export default function RatingStars({ max = 5, onChange }: RatingProps) {
const [rating, setRating] = useState(0);

const handleClick = (value: number) => {
setRating(value);
onChange?.(value);
};

return (

<div className="flex gap-1">
{[...Array(max)].map((\_, i) => (
<button key={i} onClick={() => handleClick(i + 1)}>
<span className={`material-symbols-outlined text-2xl ${i < rating ? "text-yellow-400" : "text-gray-300"}`}>
star
</span>
</button>
))}
</div>
);
}

7. DASHBOARD MOCK METRICS

app/dashboard/index.tsx

"use client";

export default function Dashboard() {
const metrics = [
{ label: "Total Complaints", value: 120 },
{ label: "Resolved", value: 98 },
{ label: "Pending AI Rewrite", value: 12 },
{ label: "Avg AI Score", value: "92%" },
];

return (

<div className="max-w-4xl mx-auto p-4 flex flex-col gap-6">
<h1 className="text-2xl font-bold text-primary">Dashboard</h1>
<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
{metrics.map(m => (
<div key={m.label} className="p-4 border rounded-xl bg-white dark:bg-[#1a2c34] shadow">
<p className="text-sm text-gray-500 dark:text-gray-300">{m.label}</p>
<p className="text-xl font-semibold">{m.value}</p>
</div>
))}
</div>
</div>
);
}

8. DARK/LIGHT MODE TOGGLE

app/components/toggle-dark.tsx

"use client";

import { useEffect, useState } from "react";

export default function ToggleDark() {
const [dark, setDark] = useState(false);

useEffect(() => {
document.documentElement.classList.toggle("dark", dark);
}, [dark]);

return (
<button onClick={() => setDark(!dark)} className="p-2 bg-primary/10 rounded-full">
{dark ? "🌙" : "☀️"}
</button>
);
}

✅ Features Implemented in Sprint6-UI

Complaint submission form (brand, subject, description, attachments).

AI rewrite preview panel.

Cursor-based complaint list.

Rating component with stars.

Dashboard mock metrics (AI insights placeholder).

File upload support for images/PDFs.

Dark/light mode toggle consistent with Sprint1-UI.

Mobile-first responsive design with TailwindCSS.

React Hook Form for validation and form handling.

Pagination component for infinite scrolling.
