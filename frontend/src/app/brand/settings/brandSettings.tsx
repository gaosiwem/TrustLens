"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
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
import InputField from "@/components/InputField";
import Button from "@/components/Button";
import {
  User,
  Building,
  Bell,
  Shield,
  Camera,
  Link as LinkIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function BrandSettings() {
  const { data: session } = useSession();
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [brandName, setBrandName] = useState("");
  const [website, setWebsite] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session?.user) {
      setUserName(session.user.name || "");
      setEmail(session.user.email || "");
      // Mock brand data - in a real app, this would come from an API
      setBrandName("TechFlow Systems");
      setWebsite("https://techflow.example");
    }
  }, [session]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      alert("Brand settings updated successfully!");
      setLoading(false);
    }, 1500);
  };

  return (
    <Tabs defaultValue="account" className="space-y-6">
      <TabsList className="bg-card border border-border h-12 p-1 gap-2">
        <TabsTrigger value="account" className="flex items-center gap-2 px-6">
          <User className="w-4 h-4" />
          Account
        </TabsTrigger>
        <TabsTrigger value="brand" className="flex items-center gap-2 px-6">
          <Building className="w-4 h-4" />
          Brand Assets
        </TabsTrigger>
        <TabsTrigger
          value="notifications"
          className="flex items-center gap-2 px-6"
        >
          <Bell className="w-4 h-4" />
          Alerts
        </TabsTrigger>
        <TabsTrigger value="security" className="flex items-center gap-2 px-6">
          <Shield className="w-4 h-4" />
          Security
        </TabsTrigger>
      </TabsList>

      <TabsContent value="account">
        <Card>
          <CardHeader>
            <CardTitle>Personal Account</CardTitle>
            <CardDescription>
              Manage your representative profile information.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdate} className="space-y-6 max-w-2xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                  label="Full Name"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Your full name"
                />
                <InputField label="Business Email" value={email} disabled />
              </div>
              <Button type="submit" className="px-8">
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="brand">
        <Card>
          <CardHeader>
            <CardTitle>Brand Identity</CardTitle>
            <CardDescription>
              Update your public brand profile and assets.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              <div className="flex items-center gap-6 p-4 rounded-2xl bg-muted/30 border border-dashed border-border">
                <div className="w-24 h-24 rounded-2xl bg-white border border-border flex items-center justify-center relative group overflow-hidden shadow-sm">
                  <Building className="w-10 h-10 text-muted-foreground group-hover:opacity-20 transition-opacity" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-bold">Brand Logo</h4>
                  <p className="text-xs text-muted-foreground">
                    Upload a square SVG or PNG (min 400x400px).
                  </p>
                  <Button variant="outline" className="text-xs h-8">
                    Upload New
                  </Button>
                </div>
              </div>

              <form
                onSubmit={handleUpdate}
                className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl"
              >
                <InputField
                  label="Brand Name"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                />
                <InputField
                  label="Website URL"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  icon="link"
                />
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-bold">Brand Biography</label>
                  <textarea
                    className="w-full h-32 bg-background border border-border rounded-xl p-4 text-sm focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                    placeholder="Tell consumers about your commitment to trust..."
                  />
                </div>
                <Button type="submit" className="px-8">
                  {loading ? "Saving..." : "Update Assets"}
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="notifications">
        <Card>
          <CardHeader>
            <CardTitle>Brand Alert Preferences</CardTitle>
            <CardDescription>
              Configure how your team receives complaint and review alerts.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6 max-w-2xl">
              {[
                {
                  title: "New Complaint Alerts",
                  desc: "Get notified immediately when a consumer files a complaint.",
                },
                {
                  title: "Resolution Reminders",
                  desc: "Daily reminders for complaints pending for more than 48h.",
                },
                {
                  title: "Sentiment Shift Alerts",
                  desc: "Alerts when overall brand sentiment drops significantly.",
                },
                {
                  title: "Weekly Performance Report",
                  desc: "A condensed summary of resolution rates and trust scores.",
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 rounded-xl hover:bg-muted/50 transition-colors"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-bold">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <div
                    className={`w-12 h-6 rounded-full relative cursor-pointer group ${idx < 2 ? "bg-primary/20" : "bg-muted border border-border"}`}
                  >
                    <div
                      className={`absolute top-1 w-4 h-4 rounded-full transition-all shadow-sm ${idx < 2 ? "left-7 bg-primary" : "left-1 bg-muted-foreground/40"}`}
                    />
                  </div>
                </div>
              ))}
              <Button onClick={() => alert("Preferences saved!")}>
                Save Alert Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="security">
        <Card>
          <CardHeader>
            <CardTitle>Team Security</CardTitle>
            <CardDescription>
              Manage security protocols for your brand account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 flex gap-4 max-w-2xl">
              <Shield className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold">Two-Factor Authentication</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Enhance your brand's security by adding an extra layer of
                  protection.
                </p>
                <Badge className="mt-2 bg-yellow-500/10 text-yellow-600 border-yellow-500/20 hover:bg-yellow-500/15">
                  Recommended
                </Badge>
              </div>
            </div>
            <Button variant="outline">Configure Security</Button>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
