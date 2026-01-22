"use client";

import { useState, useEffect } from "react";
import { apiGet } from "@/lib/api";
import { BrandSentimentDailyRow, SentimentEvent } from "@/types/sentiment";
import { SentimentTrendChart } from "@/components/charts/SentimentTrendChart";
import { SentimentDistributionChart } from "@/components/charts/SentimentDistributionChart";
import { TopicBarChart } from "@/components/charts/TopicBarChart";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { sentimentColorClass, sentimentLabelPretty } from "@/lib/format";
import {
  Brain,
  TrendingUp,
  BarChart3,
  ListFilter,
  AlertTriangle,
} from "lucide-react";

export default function SentimentDashboard() {
  const [dailyData, setDailyData] = useState<BrandSentimentDailyRow[]>([]);
  const [events, setEvents] = useState<SentimentEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState("30");

  useEffect(() => {
    setLoading(true);
    Promise.all([
      apiGet<{ rows: BrandSentimentDailyRow[] }>(
        `/api/brand/sentiment/daily?days=${days}`,
      ),
      apiGet<{ items: SentimentEvent[] }>(
        `/api/brand/sentiment/events?take=20`,
      ),
    ])
      .then(([daily, evts]) => {
        setDailyData(daily.rows);
        setEvents(evts.items);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [days]);

  if (loading && dailyData.length === 0) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[300px] rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-[400px] rounded-xl" />
      </div>
    );
  }

  const latest = dailyData[dailyData.length - 1];

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold tracking-tight">
            AI Sentiment Insights
          </h2>
        </div>
        <Select value={days} onValueChange={setDays}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 Days</SelectItem>
            <SelectItem value="30">Last 30 Days</SelectItem>
            <SelectItem value="90">Last 90 Days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <CardTitle className="text-sm font-medium">
                Sentiment Trend
              </CardTitle>
            </div>
            <CardDescription>
              Daily average sentiment vs urgency
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SentimentTrendChart rows={dailyData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              <CardTitle className="text-sm font-medium">
                Distribution
              </CardTitle>
            </div>
            <CardDescription>Overall sentiment split (Current)</CardDescription>
          </CardHeader>
          <CardContent>
            <SentimentDistributionChart rows={dailyData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <ListFilter className="w-4 h-4 text-primary" />
              <CardTitle className="text-sm font-medium">
                Top Core Topics
              </CardTitle>
            </div>
            <CardDescription>Most frequent complaint drivers</CardDescription>
          </CardHeader>
          <CardContent>
            <TopicBarChart topics={dailyData.flatMap((d) => d.topTopics)} />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="events" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="events">Recent AI Analysis</TabsTrigger>
          <TabsTrigger value="moderation">Moderation Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-start justify-between border-b border-border pb-4 last:border-0 last:pb-0"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={sentimentColorClass(event.label)}
                        >
                          {sentimentLabelPretty(event.label)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(event.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm font-medium">
                        Source: {event.sourceType.replaceAll("_", " ")}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {event.topics.map((t) => (
                          <span
                            key={t}
                            className="text-[10px] bg-muted px-1.5 py-0.5 rounded capitalize"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="text-xs font-bold">
                        Urgency: {event.urgency}%
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {event.model}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="moderation" className="mt-4">
          <Card className="border-destructive/20 bg-destructive/5">
            <CardHeader>
              <div className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="w-5 h-5" />
                <CardTitle>Safety Flags</CardTitle>
              </div>
              <CardDescription>
                Content flagged by AI moderation for review
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {events
                  .filter((e) => e.moderationFlagged)
                  .map((event) => (
                    <div
                      key={event.id}
                      className="p-3 bg-card rounded-lg border border-destructive/20"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="destructive">FLAGGED</Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(event.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm italic">
                        Potential harmful content detected in source{" "}
                        {event.sourceId}
                      </p>
                    </div>
                  ))}
                {events.filter((e) => e.moderationFlagged).length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No safety flags in recent analysis.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
