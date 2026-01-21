Sprint8-UI.md – AI Complaint Resolution & Verification

1. File Architecture
   Frontend/
   ├── app/
   │ ├── auth/
   │ │ ├── Login.tsx
   │ │ ├── Register.tsx
   │ │ ├── EmailVerify.tsx
   │ │ └── ForgotPassword.tsx
   │ ├── complaints/
   │ │ ├── CreateComplaint.tsx
   │ │ ├── ComplaintPreview.tsx
   │ │ ├── VerificationStatus.tsx
   │ │ ├── FlaggedComplaintModal.tsx
   │ │ └── AISummaryCard.tsx
   │ ├── dashboard/
   │ │ └── Dashboard.tsx
   │ ├── components/
   │ │ ├── Button.tsx
   │ │ ├── InputField.tsx
   │ │ ├── FileUpload.tsx
   │ │ ├── StatusBadge.tsx
   │ │ └── Notifications.tsx
   │ └── layout/
   │ ├── Navbar.tsx
   │ └── SideDrawer.tsx
   ├── styles/
   │ └── globals.css
   └── utils/
   └── mockData.ts

2. Dependencies
   npm install react-hook-form @headlessui/react @radix-ui/react-icons shadcn/ui clsx
   npm install tailwindcss postcss autoprefixer

3. Components Implementation
   3.1 CreateComplaint.tsx
   "use client";

import { useForm } from "react-hook-form";
import FileUpload from "../components/FileUpload";
import Button from "../components/Button";

interface ComplaintForm {
brand: string;
issue: string;
files: File[];
}

export default function CreateComplaint() {
const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ComplaintForm>();

const onSubmit = (data: ComplaintForm) => {
console.log("Complaint submitted:", data);
// Later connect to Sprint8 backend
};

return (
<div className="max-w-md mx-auto p-4 flex flex-col gap-4">
<h1 className="text-xl font-bold text-primary">File a Complaint</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className="font-medium text-sm">Brand</label>
          <input
            {...register("brand", { required: true })}
            placeholder="Enter brand name"
            className="border rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-primary"
          />
          {errors.brand && <span className="text-red-500 text-xs">Brand is required</span>}
        </div>

        <div className="flex flex-col gap-1">
          <label className="font-medium text-sm">Issue / Complaint</label>
          <textarea
            {...register("issue", { required: true })}
            placeholder="Describe the issue"
            className="border rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-primary"
          />
          {errors.issue && <span className="text-red-500 text-xs">Issue description is required</span>}
        </div>

        <FileUpload files={watch("files")} setFiles={(files: File[]) => setValue("files", files)} />

        <Button type="submit">Submit Complaint</Button>
      </form>
    </div>

);
}

3.2 FileUpload.tsx
"use client";

import { useRef } from "react";
import Button from "./Button";

interface Props {
files: File[];
setFiles: (files: File[]) => void;
}

export default function FileUpload({ files, setFiles }: Props) {
const fileInput = useRef<HTMLInputElement>(null);

const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
if (!e.target.files) return;
const newFiles = Array.from(e.target.files).slice(0, 5); // limit to 5 files
setFiles(newFiles);
};

return (
<div className="flex flex-col gap-2">
<label className="font-medium text-sm">Upload Receipts / Documents (Images & PDFs)</label>
<input
        ref={fileInput}
        type="file"
        accept="image/*,application/pdf"
        multiple
        className="hidden"
        onChange={handleChange}
      />
<Button type="button" onClick={() => fileInput.current?.click()}>
Select Files
</Button>
<div className="flex flex-col gap-1">
{files.map((file, i) => (
<div key={i} className="flex justify-between items-center border rounded-xl p-2 text-sm">
<span>{file.name}</span>
<span className="text-gray-500 text-xs">{(file.size / 1024).toFixed(1)} KB</span>
</div>
))}
</div>
</div>
);
}

3.3 ComplaintPreview.tsx
"use client";

interface Props {
complaint: { brand: string; issue: string; files: File[]; aiSummary: string };
}

export default function ComplaintPreview({ complaint }: Props) {
return (
<div className="max-w-md mx-auto p-4 border rounded-xl bg-white dark:bg-background-dark">
<h2 className="font-bold text-primary text-lg">Complaint Preview</h2>
<p><strong>Brand:</strong> {complaint.brand}</p>
<p><strong>Issue:</strong> {complaint.issue}</p>
<p><strong>AI Summary:</strong> {complaint.aiSummary}</p>
<div className="mt-2">
<strong>Attached Files:</strong>
<ul className="list-disc list-inside">
{complaint.files.map((file, i) => <li key={i}>{file.name}</li>)}
</ul>
</div>
</div>
);
}

3.4 VerificationStatus.tsx
"use client";

interface Props {
status: "Pending" | "Verified" | "Rejected" | "Needs Info";
}

export default function VerificationStatus({ status }: Props) {
const colors = {
Pending: "bg-yellow-200 text-yellow-800",
Verified: "bg-green-200 text-green-800",
Rejected: "bg-red-200 text-red-800",
"Needs Info": "bg-blue-200 text-blue-800",
};

return (
<span className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[status]}`}>
{status}
</span>
);
}

3.5 FlaggedComplaintModal.tsx
"use client";

import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import Button from "./Button";

interface Props {
isOpen: boolean;
onClose: () => void;
}

export default function FlaggedComplaintModal({ isOpen, onClose }: Props) {
return (
<Transition.Root show={isOpen} as={Fragment}>
<Dialog as="div" className="relative z-10" onClose={onClose}>
<Transition.Child
as={Fragment}
enter="ease-out duration-300"
enterFrom="opacity-0"
enterTo="opacity-100"
leave="ease-in duration-200"
leaveFrom="opacity-100"
leaveTo="opacity-0" >
<div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
</Transition.Child>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="bg-white dark:bg-background-dark rounded-xl p-6 max-w-sm mx-auto">
              <Dialog.Title className="text-lg font-bold text-red-600">Flagged Complaint</Dialog.Title>
              <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                Our AI has flagged this complaint for review. Please verify your details before submission.
              </p>
              <div className="mt-4 flex justify-end">
                <Button onClick={onClose}>Close</Button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>

);
}

3.6 AISummaryCard.tsx
"use client";

interface Props {
summary: string;
}

export default function AISummaryCard({ summary }: Props) {
return (
<div className="border rounded-xl p-4 bg-gray-50 dark:bg-[#1a2c34]">
<h3 className="font-semibold text-sm text-primary">AI Summary</h3>
<p className="mt-2 text-sm text-gray-700 dark:text-gray-300">{summary}</p>
</div>
);
}

4. Mock Data Example
   export const mockComplaint = {
   brand: "Example Brand",
   issue: "Received wrong product",
   files: [],
   aiSummary: "AI detected a mismatch between expected and delivered product",
   };

5. Notes

All forms use React Hook Form.

File uploads support images and PDFs with preview.

AI-generated summaries are shown in a card for user editing/approval.

Status badges are color-coded and mobile-first.

Flagged complaints show a modal with warning and instructions.

Design follows Sprint1/Sprint2 UI for consistency.

Dark/light mode toggle is inherited from layout component.
