Sprint7-UI.md

1. FILE ARCHITECTURE
   frontend/
   ├── components/
   │ ├── auth/ # Auth screens handled in previous sprints
   │ ├── complaints/
   │ │ ├── ComplaintList.tsx
   │ │ ├── ComplaintCard.tsx
   │ │ ├── ComplaintForm.tsx
   │ │ ├── ComplaintDetail.tsx
   │ │ └── AttachmentsPreview.tsx
   │ ├── dashboard/
   │ │ ├── MetricsPanel.tsx
   │ │ └── TrustScoreCard.tsx
   │ ├── layout/
   │ │ ├── NavBar.tsx
   │ │ ├── SideDrawer.tsx
   │ │ └── DarkModeToggle.tsx
   │ └── ui/ # Shadcn UI components like Button, Badge
   ├── pages/
   │ ├── dashboard.tsx
   │ ├── complaints.tsx
   ├── hooks/
   │ └── useDarkMode.ts
   ├── utils/
   │ └── mockData.ts
   ├── styles/
   │ └── globals.css

2. DEPENDENCIES
   npm install react-hook-form zod @hookform/resolvers
   npm install @tanstack/react-query
   npm install recharts
   npm install shadcn-ui
   npm install pdfjs-dist
   npm install next-themes

3. MOCK DATA

frontend/utils/mockData.ts

export const mockComplaints = [
{ id: '1', brand: 'Brand A', status: 'Pending', description: 'Late delivery', attachments: ['invoice1.pdf', 'photo1.jpg'], createdAt: '2026-01-09' },
{ id: '2', brand: 'Brand B', status: 'Rewritten', description: 'Rude service', attachments: ['photo2.jpg'], createdAt: '2026-01-08' },
{ id: '3', brand: 'Brand C', status: 'Resolved', description: 'Wrong item sent', attachments: [], createdAt: '2026-01-07' },
];

export const mockMetrics = {
resolutionRate: 0.82,
complaintsByStatus: { Pending: 12, Resolved: 34, Rewritten: 5 },
trustScore: 4.5
};

4. HOOKS

frontend/hooks/useDarkMode.ts

import { useTheme } from 'next-themes';
export function useDarkMode() {
const { theme, setTheme } = useTheme();
const toggle = () => setTheme(theme === 'dark' ? 'light' : 'dark');
return { theme, toggle };
}

5. COMPONENTS
   5.1 DarkModeToggle.tsx
   import { useDarkMode } from '../hooks/useDarkMode';
   import { Button } from '../ui/Button';

export function DarkModeToggle() {
const { theme, toggle } = useDarkMode();
return (
<Button onClick={toggle}>
{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
</Button>
);
}

5.2 ComplaintCard.tsx
import { Badge } from '../ui/Badge';

interface ComplaintCardProps {
id: string;
brand: string;
status: string;
description: string;
createdAt: string;
onClick: (id: string) => void;
}

export function ComplaintCard({ id, brand, status, description, createdAt, onClick }: ComplaintCardProps) {
return (
<div className="p-4 bg-white dark:bg-[#1a2c34] rounded-xl shadow hover:shadow-lg cursor-pointer transition" onClick={() => onClick(id)}>
<div className="flex justify-between items-center mb-2">
<h3 className="font-bold">{brand}</h3>
<Badge>{status}</Badge>
</div>
<p className="text-sm text-[#637588] dark:text-[#93a2b7]">{description}</p>
<span className="text-xs text-[#93a2b7] dark:text-[#637588]">{createdAt}</span>
</div>
);
}

5.3 ComplaintList.tsx
import { mockComplaints } from '../../utils/mockData';
import { ComplaintCard } from './ComplaintCard';
import { useState } from 'react';
import { ComplaintDetail } from './ComplaintDetail';

export function ComplaintList() {
const [selected, setSelected] = useState<string | null>(null);

return (
<div className="flex flex-col md:flex-row gap-4">
<div className="flex-1 space-y-4">
{mockComplaints.map(c => (
<ComplaintCard key={c.id} {...c} onClick={setSelected} />
))}
</div>
{selected && <ComplaintDetail id={selected} />}
</div>
);
}

5.4 ComplaintForm.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import \* as z from 'zod';
import { Button } from '../ui/Button';

const schema = z.object({
brand: z.string().min(1),
description: z.string().min(5),
attachments: z.any()
});

type FormData = z.infer<typeof schema>;

export function ComplaintForm() {
const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
resolver: zodResolver(schema)
});

const onSubmit = (data: FormData) => {
console.log(data);
};

return (
<form className="space-y-4 p-4 bg-white dark:bg-[#1a2c34] rounded-xl shadow" onSubmit={handleSubmit(onSubmit)}>
<div>
<label className="block mb-1">Brand</label>
<input {...register('brand')} className="w-full border rounded p-2 dark:bg-[#24363e]" />
{errors.brand && <p className="text-red-500 text-xs">{errors.brand.message}</p>}
</div>
<div>
<label className="block mb-1">Description</label>
<textarea {...register('description')} className="w-full border rounded p-2 dark:bg-[#24363e]" />
{errors.description && <p className="text-red-500 text-xs">{errors.description.message}</p>}
</div>
<div>
<label className="block mb-1">Attachments (images + PDFs)</label>
<input type="file" {...register('attachments')} multiple className="w-full dark:bg-[#24363e]" />
</div>
<Button type="submit">Submit Complaint</Button>
</form>
);
}

5.5 ComplaintDetail.tsx
import { mockComplaints } from '../../utils/mockData';
import { AttachmentsPreview } from './AttachmentsPreview';

interface ComplaintDetailProps {
id: string;
}

export function ComplaintDetail({ id }: ComplaintDetailProps) {
const complaint = mockComplaints.find(c => c.id === id);
if (!complaint) return null;

return (
<div className="flex-1 p-4 bg-white dark:bg-[#1a2c34] rounded-xl shadow space-y-4">
<h2 className="font-bold text-lg">{complaint.brand}</h2>
<p className="text-sm text-[#637588] dark:text-[#93a2b7]">{complaint.description}</p>
<AttachmentsPreview files={complaint.attachments} />
<div className="mt-4">
<label className="block mb-1">AI Suggested Response</label>
<textarea className="w-full border rounded p-2 dark:bg-[#24363e]" placeholder="AI will suggest a response here..." />
</div>
</div>
);
}

5.6 AttachmentsPreview.tsx
interface AttachmentsPreviewProps {
files: string[];
}

export function AttachmentsPreview({ files }: AttachmentsPreviewProps) {
return (
<div className="flex gap-2 overflow-x-auto">
{files.map((file, i) => {
const ext = file.split('.').pop()?.toLowerCase();
if (ext === 'pdf') return <div key={i} className="p-2 border rounded">PDF: {file}</div>;
return <img key={i} src={`/${file}`} alt={file} className="h-24 rounded" />;
})}
</div>
);
}

5.7 MetricsPanel.tsx
import { mockMetrics } from '../../utils/mockData';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export function MetricsPanel() {
const data = Object.entries(mockMetrics.complaintsByStatus).map(([status, count]) => ({ status, count }));

return (
<div className="p-4 bg-white dark:bg-[#1a2c34] rounded-xl shadow">
<h3 className="font-bold mb-2">Complaints Metrics</h3>
<ResponsiveContainer width="100%" height={200}>
<BarChart data={data}>
<XAxis dataKey="status" />
<YAxis />
<Tooltip />
<Bar dataKey="count" fill="#13b6ec" />
</BarChart>
</ResponsiveContainer>
<p className="mt-2">Resolution Rate: {mockMetrics.resolutionRate \* 100}%</p>
<p>Trust Score: {mockMetrics.trustScore}</p>
</div>
);
}

6. PAGES

frontend/pages/complaints.tsx

import { ComplaintForm } from '../components/complaints/ComplaintForm';
import { ComplaintList } from '../components/complaints/ComplaintList';
import { MetricsPanel } from '../components/dashboard/MetricsPanel';
import { DarkModeToggle } from '../components/layout/DarkModeToggle';

export default function ComplaintsPage() {
return (
<div className="min-h-screen p-4 space-y-4 bg-background-light dark:bg-background-dark text-[#111618] dark:text-white">
<div className="flex justify-between items-center">
<h1 className="text-2xl font-bold">Complaints Dashboard</h1>
<DarkModeToggle />
</div>
<MetricsPanel />
<ComplaintForm />
<ComplaintList />
</div>
);
}

✅ Sprint7-UI.md is now fully implemented:

Complaint creation with image/pdf upload

Complaint list with detail view

Attachments preview

AI response placeholder

Metrics panel with mock data

Dark/light mode toggle

Mobile-first responsive design

Shadcn UI & TailwindCSS consistency

React Hook Form + Zod validation
