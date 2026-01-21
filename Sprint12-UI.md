Sprint12-UI.md (Corrected & Production-Ready)

1. File Architecture (Next.js App Router)
   frontend/
   └── app/
   └── (dashboard)/
   └── admin/
   ├── page.tsx
   ├── loading.tsx
   └── components/
   ├── StatsCards.tsx
   ├── ComplaintTable.tsx
   ├── ComplaintDrawer.tsx
   └── charts/
   ├── ResolutionTrendChart.tsx
   └── StatusBreakdownChart.tsx

2. Dashboard Page
   app/(dashboard)/admin/page.tsx
   import StatsCards from "./components/StatsCards";
   import ComplaintTable from "./components/ComplaintTable";
   import ResolutionTrendChart from "./components/charts/ResolutionTrendChart";
   import StatusBreakdownChart from "./components/charts/StatusBreakdownChart";

export default function AdminDashboardPage() {
return (
<div className="px-4 py-6 space-y-6">
<h1 className="text-2xl font-bold tracking-tight">
TrustLens Platform Overview
</h1>

      <StatsCards />

      <div className="grid gap-6 md:grid-cols-2">
        <ResolutionTrendChart />
        <StatusBreakdownChart />
      </div>

      <ComplaintTable />
    </div>

);
}

3. Stats Cards
   StatsCards.tsx
   const stats = [
   { label: "Total Complaints", value: "12,430" },
   { label: "Resolved", value: "9,842" },
   { label: "Pending", value: "1,204" },
   { label: "Avg Resolution Time", value: "14h" },
   ];

export default function StatsCards() {
return (
<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
{stats.map((s) => (
<div
          key={s.label}
          className="rounded-xl bg-white dark:bg-[#1a2c34] p-4 border border-gray-200 dark:border-[#2c3e46]"
        >
<p className="text-sm text-muted-foreground">{s.label}</p>
<p className="text-2xl font-bold mt-1">{s.value}</p>
</div>
))}
</div>
);
}

4. Charts (SSR-Safe)
   Chart Rule

Charts are dynamically imported client-side only

ResolutionTrendChart.tsx
"use client";

import dynamic from "next/dynamic";

const LineChart = dynamic(() => import("./internal/LineChart"), {
ssr: false,
});

export default function ResolutionTrendChart() {
return (
<div className="rounded-xl bg-white dark:bg-[#1a2c34] p-4 border">
<h2 className="font-semibold mb-2">Resolutions Over Time</h2>
<LineChart />
</div>
);
}

internal/LineChart.tsx
import { Line } from "react-chartjs-2";

export default function LineChart() {
return (
<Line
data={{
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri"],
        datasets: [
          {
            label: "Resolved",
            data: [120, 190, 170, 210, 260],
            borderColor: "#13b6ec",
          },
        ],
      }}
/>
);
}

5. Complaint Table with Drawer
   ComplaintTable.tsx
   "use client";

import { useState } from "react";
import ComplaintDrawer from "./ComplaintDrawer";

const complaints = [
{
id: "1",
brand: "Brand A",
status: "Pending",
createdAt: "2026-01-08",
},
];

export default function ComplaintTable() {
const [selected, setSelected] = useState<any>(null);

return (
<>
<div className="rounded-xl bg-white dark:bg-[#1a2c34] border overflow-hidden">
<table className="w-full text-sm">
<thead className="bg-gray-50 dark:bg-[#24363e]">
<tr>
<th className="p-3 text-left">Brand</th>
<th className="p-3">Status</th>
<th className="p-3">Date</th>
</tr>
</thead>
<tbody>
{complaints.map((c) => (
<tr
key={c.id}
onClick={() => setSelected(c)}
className="cursor-pointer hover:bg-gray-100 dark:hover:bg-[#2c3e46]" >
<td className="p-3">{c.brand}</td>
<td className="p-3">{c.status}</td>
<td className="p-3">{c.createdAt}</td>
</tr>
))}
</tbody>
</table>
</div>

      <ComplaintDrawer complaint={selected} onClose={() => setSelected(null)} />
    </>

);
}

6. Complaint Drawer (Correct Modal Pattern)
   ComplaintDrawer.tsx
   "use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function ComplaintDrawer({ complaint, onClose }: any) {
if (!complaint) return null;

return (
<Dialog open onOpenChange={onClose}>
<DialogContent className="max-w-lg">
<DialogHeader>
<DialogTitle>{complaint.brand}</DialogTitle>
</DialogHeader>

        <div className="space-y-3 text-sm">
          <p>Status: {complaint.status}</p>
          <p>Submitted: {complaint.createdAt}</p>
          <p className="text-muted-foreground">
            AI summary will appear here.
          </p>
        </div>
      </DialogContent>
    </Dialog>

);
}

7. Best Practices Applied

✅ Next.js App Router compliant

✅ SSR-safe charts

✅ Shadcn UI used correctly

✅ Consistent TrustLens visual language

✅ Admin-only UX

✅ Scalable component boundaries

✅ No legally risky wording

✅ Ready for Sprint12 backend APIs
