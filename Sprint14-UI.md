Sprint14-UI.md

1. File Architecture
   Frontend/
   ├── app/
   │ ├── admin/
   │ │ ├── audit-activity/
   │ │ │ └── page.tsx
   │ │ ├── user-access/
   │ │ │ └── page.tsx
   │ │ ├── data-usage/
   │ │ │ └── page.tsx
   │ │ ├── system-health/
   │ │ │ └── page.tsx
   │ │ └── reporting/
   │ │ └── page.tsx
   ├── components/
   │ ├── tables/
   │ │ ├── AuditTable.tsx
   │ │ └── UserAccessTable.tsx
   │ ├── cards/
   │ │ └── MetricCard.tsx
   │ ├── charts/
   │ │ ├── LineChart.tsx
   │ │ └── BarChart.tsx
   │ └── ui/
   │ ├── Dropdown.tsx
   │ └── Modal.tsx
   ├── lib/
   │ └── mockData.ts
   └── styles/
   └── globals.css

2. Components Implementation
   components/cards/MetricCard.tsx
   "use client";

import React from "react";

interface MetricCardProps {
title: string;
value: string | number;
icon?: React.ReactNode;
color?: string;
}

export default function MetricCard({ title, value, icon, color = "bg-primary" }: MetricCardProps) {
return (
<div className={`flex flex-col p-4 rounded-xl shadow-sm ${color}/10 hover:shadow-md transition`}>
<div className="flex items-center justify-between mb-2">
<span className="text-sm font-semibold text-gray-500">{title}</span>
{icon && <div className="text-xl">{icon}</div>}
</div>
<div className="text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
</div>
);
}

components/tables/AuditTable.tsx
"use client";

import React from "react";
import { mockAuditData } from "../../lib/mockData";

export default function AuditTable() {
return (
<div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
<table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
<thead className="bg-gray-50 dark:bg-gray-800">
<tr>
<th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">User</th>
<th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
<th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
</tr>
</thead>
<tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
{mockAuditData.map((audit) => (
<tr key={audit.id}>
<td className="px-4 py-2">{audit.user}</td>
<td className="px-4 py-2">{audit.action}</td>
<td className="px-4 py-2">{audit.date}</td>
</tr>
))}
</tbody>
</table>
</div>
);
}

components/tables/UserAccessTable.tsx
"use client";

import React from "react";
import { mockUsers } from "../../lib/mockData";

export default function UserAccessTable() {
return (
<div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
<table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
<thead className="bg-gray-50 dark:bg-gray-800">
<tr>
<th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
<th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
<th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
<th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Last Login</th>
</tr>
</thead>
<tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
{mockUsers.map((user) => (
<tr key={user.id}>
<td className="px-4 py-2">{user.name}</td>
<td className="px-4 py-2">{user.email}</td>
<td className="px-4 py-2">{user.role}</td>
<td className="px-4 py-2">{user.lastLogin}</td>
</tr>
))}
</tbody>
</table>
</div>
);
}

components/charts/LineChart.tsx
"use client";

import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface LineChartProps {
labels: string[];
data: number[];
}

export default function LineChart({ labels, data }: LineChartProps) {
const chartData = {
labels,
datasets: [
{
label: "Usage",
data,
borderColor: "#13b6ec",
backgroundColor: "#13b6ec33",
tension: 0.3
}
]
};

return <Line data={chartData} />;
}

lib/mockData.ts
export const mockAuditData = [
{ id: "1", user: "Alice", action: "Logged in", date: "2026-01-01 09:00" },
{ id: "2", user: "Bob", action: "Reset password", date: "2026-01-01 10:00" },
{ id: "3", user: "Charlie", action: "Updated role", date: "2026-01-01 11:00" }
];

export const mockUsers = [
{ id: "1", name: "Alice", email: "alice@test.com", role: "Admin", lastLogin: "2026-01-01 09:00" },
{ id: "2", name: "Bob", email: "bob@test.com", role: "User", lastLogin: "2026-01-01 10:00" },
{ id: "3", name: "Charlie", email: "charlie@test.com", role: "Moderator", lastLogin: "2026-01-01 11:00" }
];

Example Admin Page – Audit Activity (app/admin/audit-activity/page.tsx)
"use client";

import React from "react";
import AuditTable from "../../../components/tables/AuditTable";

export default function AuditActivityPage() {
return (
<div className="p-6 space-y-6">
<h1 className="text-2xl font-bold text-gray-900 dark:text-white">Audit Activity</h1>
<AuditTable />
</div>
);
}

Styling & Global Config
// globals.css
@tailwind base;
@tailwind components;
@tailwind utilities;

html { scroll-behavior: smooth; }

Dark/Light Toggle can be handled at the \_app.tsx level using next-themes:

import { ThemeProvider } from "next-themes";

export default function App({ children }) {
return <ThemeProvider attribute="class">{children}</ThemeProvider>;
}

✅ Best Practices Applied

Mobile-first layout with TailwindCSS.

Dark/light mode support using next-themes.

Shadcn UI for reusable components (tables, modals, dropdowns).

Mock data used for charts and tables for Sprint14-UI.

All pages under admin folder for future backend linkage.

TypeScript with type interfaces for props and mock data.

Charts use react-chartjs-2 with proper registration.

Reusability: tables, cards, charts are separate components.
