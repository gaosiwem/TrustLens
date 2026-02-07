"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Construction } from "lucide-react";

export default function GovernanceDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">
          Platform Governance
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Construction className="h-5 w-5 text-muted-foreground" />
            Under Construction
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            The Governance Dashboard is currently under development. This module
            will include:
          </p>
          <ul className="list-disc list-inside mt-4 space-y-2 text-sm text-muted-foreground">
            <li>Platform policy settings</li>
            <li>Content moderation logs</li>
            <li>Admin audit trails</li>
            <li>System configuration</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
