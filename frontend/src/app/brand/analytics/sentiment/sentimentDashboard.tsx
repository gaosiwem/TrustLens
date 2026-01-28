"use client";

import { useState, useEffect } from "react";
import { apiGet } from "@/lib/api";
import { BrandSentimentDailyRow, SentimentEvent } from "@/types/sentiment";
import { SentimentTrendChart } from "@/components/charts/SentimentTrendChart";
import { SentimentDistributionChart } from "@/components/charts/SentimentDistributionChart";
import { TopicBarChart } from "@/components/charts/TopicBarChart";
import { RatingDistributionChart } from "@/components/charts/RatingDistributionChart";
import { Badge } from "@/components/ui/badge";
import { sentimentColorClass, sentimentLabelPretty } from "@/lib/format";
import { FeatureGate } from "@/components/subscription/FeatureGate";
import {
  Brain,
  TrendingUp,
  BarChart3,
  ListFilter,
  AlertTriangle,
  Activity,
  Clock,
  MessageSquare,
  Sparkles,
  Star,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

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

  const latest = dailyData[dailyData.length - 1];
  const flaggedCount = events.filter((e) => e.moderationFlagged).length;
  const avgStarsRaw =
    dailyData.reduce((a, b) => a + (b.avgStars || 0), 0) /
    (dailyData.filter((d) => d.avgStars !== null).length || 1);
  const avgStars = avgStarsRaw > 0 ? avgStarsRaw.toFixed(1) : "N/A";

  if (loading && dailyData.length === 0) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-[120px] rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[320px] rounded-3xl" />
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: "Avg Sentiment",
      value: latest?.avgScore ? (latest.avgScore * 100).toFixed(0) + "%" : "—",
      icon: Brain,
      color: "text-violet-500",
      bgColor: "bg-violet-500/10",
      description:
        "Overall emotional tone of customer feedback. Higher is more positive.",
    },
    {
      label: "Avg Urgency",
      value: latest?.avgUrgency ? Math.round(latest.avgUrgency) + "%" : "—",
      icon: Activity,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
      description: "How urgently customers need their issues resolved.",
    },
    {
      label: "Events Analyzed",
      value: dailyData.reduce((sum, d) => sum + d.count, 0),
      icon: MessageSquare,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      description: "Total complaints and responses processed by AI.",
    },
    {
      label: "Safety Flags",
      value: flaggedCount,
      icon: AlertTriangle,
      color: flaggedCount > 0 ? "text-destructive" : "text-emerald-500",
      bgColor: flaggedCount > 0 ? "bg-destructive/10" : "bg-emerald-500/10",
      description: "Content flagged for review by AI moderation.",
    },
    {
      label: "Avg Rating",
      value: avgStars,
      icon: Star,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
      description: "Average customer star rating from feedback.",
    },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black tracking-widest mb-4 uppercase">
            <Sparkles className="h-3 w-3" />
            AI-Powered Analysis
          </div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">
            Emotional <span className="text-primary italic">Intelligence</span>
          </h2>
          <p className="text-muted-foreground font-medium max-w-lg text-sm">
            Deep dive into the psychological landscape of your customer
            feedback. Powered by advanced natural language processing.
          </p>
        </div>
        <Select value={days} onValueChange={setDays}>
          <SelectTrigger className="w-[160px] rounded-xl">
            <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Select Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 Days</SelectItem>
            <SelectItem value="30">Last 30 Days</SelectItem>
            <SelectItem value="90">Last 90 Days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="group p-4 rounded-2xl bg-card border border-border hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className={`w-10 h-10 rounded-xl ${stat.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform`}
              >
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </div>
            <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
              {stat.label}
            </p>
            <p className="text-[10px] text-muted-foreground/70 mt-1 leading-tight">
              {stat.description}
            </p>
          </div>
        ))}
      </div>

      {/* Main Charts Grid */}
      <FeatureGate feature="sentimentTracking">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sentiment Trend */}
          <div className="lg:col-span-2 p-6 rounded-3xl bg-card border border-border hover:shadow-xl hover:shadow-primary/5 transition-all duration-500">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold">Sentiment Trajectory</h3>
                  <p className="text-xs text-muted-foreground">
                    Daily average sentiment vs urgency over time
                  </p>
                </div>
              </div>
            </div>
            <div className="mb-4 p-3 rounded-xl bg-muted/30 border border-border/50">
              <p className="text-xs text-muted-foreground leading-relaxed">
                <span className="font-semibold text-foreground">
                  What this shows:
                </span>{" "}
                The blue line tracks how positive or negative customer feedback
                is trending daily. The orange line shows urgency levels—spikes
                indicate customers with time-sensitive issues. Tracking both
                helps you identify when sentiment drops coincide with urgent
                complaints.
              </p>
            </div>
            <SentimentTrendChart rows={dailyData} />
          </div>

          {/* Distribution */}
          <div className="p-6 rounded-3xl bg-card border border-border hover:shadow-xl hover:shadow-primary/5 transition-all duration-500">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-bold">Sentiment Breakdown</h3>
                <p className="text-xs text-muted-foreground">
                  Emotional distribution of feedback
                </p>
              </div>
            </div>
            <div className="mb-4 p-3 rounded-xl bg-muted/30 border border-border/50">
              <p className="text-xs text-muted-foreground leading-relaxed">
                <span className="font-semibold text-foreground">
                  What this shows:
                </span>{" "}
                Percentage split of customer emotions—green (positive), red
                (negative), gray (neutral). A healthy brand has more green than
                red.
              </p>
            </div>
            <SentimentDistributionChart rows={dailyData} />
          </div>
          {/* Rating Distribution */}
          <div className="p-6 rounded-3xl bg-card border border-border hover:shadow-xl hover:shadow-primary/5 transition-all duration-500">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Star className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <h3 className="font-bold">Rating Distribution</h3>
                <p className="text-xs text-muted-foreground">
                  Customer satisfaction split
                </p>
              </div>
            </div>
            <div className="mb-4 p-3 rounded-xl bg-muted/30 border border-border/50">
              <p className="text-xs text-muted-foreground leading-relaxed">
                <span className="font-semibold text-foreground">
                  What this shows:
                </span>{" "}
                Frequency of star ratings from 1 to 5. Allows you to see if your
                resolution process is resulting in high-star reviews.
              </p>
            </div>
            <RatingDistributionChart events={events} />
          </div>
        </div>
      </FeatureGate>

      {/* Topics and Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Topics */}
        <FeatureGate feature="sentimentTracking">
          <div className="p-6 rounded-3xl bg-card border border-border hover:shadow-xl hover:shadow-primary/5 transition-all duration-500">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <ListFilter className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-bold">Core Topics</h3>
                <p className="text-xs text-muted-foreground">
                  Most frequent complaint drivers
                </p>
              </div>
            </div>
            <div className="mb-4 p-3 rounded-xl bg-muted/30 border border-border/50">
              <p className="text-xs text-muted-foreground leading-relaxed">
                <span className="font-semibold text-foreground">
                  What this shows:
                </span>{" "}
                AI-extracted categories from customer complaints. Longer bars
                mean more customers mention that topic. Use this to prioritize
                which operational areas need attention.
              </p>
            </div>
            <TopicBarChart topics={events.flatMap((e) => e.topics || [])} />
          </div>
        </FeatureGate>

        {/* Recent Events */}
        <div className="p-6 rounded-3xl bg-card border border-border hover:shadow-xl hover:shadow-primary/5 transition-all duration-500">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Brain className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-bold">Recent AI Analysis</h3>
              <p className="text-xs text-muted-foreground">
                Latest sentiment evaluations
              </p>
            </div>
          </div>
          <div className="mb-4 p-3 rounded-xl bg-muted/30 border border-border/50">
            <p className="text-xs text-muted-foreground leading-relaxed">
              <span className="font-semibold text-foreground">
                What this shows:
              </span>{" "}
              Real-time AI analysis of each customer interaction. Badges show
              emotional tone, urgency percentage indicates how quickly the
              customer expects resolution.
            </p>
          </div>
          <div className="space-y-3 max-h-[320px] overflow-y-auto pr-2">
            {events.slice(0, 6).map((event) => (
              <div
                key={event.id}
                className="flex items-start justify-between p-3 rounded-xl bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={sentimentColorClass(event.label)}
                    >
                      {sentimentLabelPretty(event.label)}
                    </Badge>
                    {event.sourceType === "RATING" && (
                      <div className="flex items-center gap-0.5 ml-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`h-2.5 w-2.5 ${
                              s <= (event.rating?.stars || 0)
                                ? "fill-amber-500 text-amber-500"
                                : "text-muted-foreground/30"
                            }`}
                          />
                        ))}
                      </div>
                    )}
                    {event.moderationFlagged && (
                      <Badge variant="destructive" className="text-[9px]">
                        FLAGGED
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {event.topics.slice(0, 3).map((t) => (
                      <span
                        key={t}
                        className="text-[9px] bg-muted px-1.5 py-0.5 rounded-md capitalize font-medium"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-right shrink-0 ml-2">
                  <div className="text-xs font-bold text-foreground/80">
                    {event.urgency}%
                  </div>
                  <div className="text-[9px] text-muted-foreground">
                    urgency
                  </div>
                </div>
              </div>
            ))}
            {events.length === 0 && (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No analysis events yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Moderation Alerts */}
      {flaggedCount > 0 && (
        <div className="p-6 rounded-3xl border-2 border-destructive/20 bg-destructive/5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <h3 className="font-bold text-destructive">
                Safety Flags ({flaggedCount})
              </h3>
              <p className="text-xs text-muted-foreground">
                Content flagged by AI moderation for review
              </p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            {events
              .filter((e) => e.moderationFlagged)
              .slice(0, 4)
              .map((event) => (
                <div
                  key={event.id}
                  className="p-4 bg-card rounded-xl border border-destructive/20"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="destructive">FLAGGED</Badge>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(event.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Source: {event.sourceType.replaceAll("_", " ")}
                  </p>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
