"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import UserHeader from "@/components/dashboard/UserHeader";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import InputField from "@/components/InputField";
import Button from "@/components/Button";
import { User, Shield, Bell, Lock } from "lucide-react";

export default function UserSettingsPage() {
  const { data: session, status } = useSession();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || "");
      setEmail(session.user.email || "");
    }
  }, [session]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Mock update logic
    setTimeout(() => {
      alert("Settings updated successfully!");
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full bg-background/50">
      <UserHeader
        title="Settings"
        subtitle="Manage your profile, security, and notification preferences"
      />

      <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="bg-card border border-border h-12 p-1 gap-2">
            <TabsTrigger
              value="profile"
              className="flex items-center gap-2 px-6"
            >
              <User className="w-4 h-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className="flex items-center gap-2 px-6"
            >
              <Shield className="w-4 h-4" />
              Security
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="flex items-center gap-2 px-6"
            >
              <Bell className="w-4 h-4" />
              Notifications
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card className="border-border shadow-sm">
              <CardHeader>
                <CardTitle>Public Profile</CardTitle>
                <CardDescription>
                  Update your personal information and how you appear to others.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={handleUpdateProfile}
                  className="space-y-6 max-w-2xl"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField
                      label="Display Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your full name"
                    />
                    <InputField
                      label="Email Address"
                      value={email}
                      disabled
                      placeholder="your@email.com"
                    />
                    <InputField
                      label="Phone Number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                  <div className="flex justify-start">
                    <Button type="submit" className="w-full md:w-auto px-8">
                      {loading ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card className="border-border shadow-sm">
              <CardHeader>
                <CardTitle>Security & Password</CardTitle>
                <CardDescription>
                  Manage your password and account security settings.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="max-w-md space-y-4">
                  <div className="p-4 rounded-xl border border-yellow-500/20 bg-yellow-500/5 flex gap-4">
                    <Lock className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold">Change Password</p>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        It's a good idea to use a unique password that you don't
                        use elsewhere.
                      </p>
                      <Button variant="outline" className="mt-4 text-xs h-9">
                        Update Password
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-border">
                  <p className="text-sm font-bold text-destructive">
                    Danger Zone
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Once you delete your account, there is no going back. Please
                    be certain.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4 border-destructive text-destructive hover:bg-destructive hover:text-white transition-colors text-xs h-9"
                  >
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card className="border-border shadow-sm">
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Control how and when you receive updates from TrustLens.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6 max-w-2xl">
                  {[
                    {
                      title: "Email Notifications",
                      desc: "Receive email updates about your complaint status.",
                    },
                    {
                      title: "Marketing Emails",
                      desc: "Tips, tricks, and new feature announcements.",
                    },
                    {
                      title: "Weekly Insights",
                      desc: "A summary of your trust rankings and AI insights.",
                    },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-4 rounded-xl hover:bg-muted/50 transition-colors"
                    >
                      <div className="space-y-1">
                        <p className="text-sm font-bold">{item.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.desc}
                        </p>
                      </div>
                      <div className="w-12 h-6 bg-primary/20 rounded-full relative cursor-pointer group">
                        <div className="absolute left-1 top-1 w-4 h-4 bg-primary rounded-full transition-all group-hover:scale-110 shadow-sm" />
                      </div>
                    </div>
                  ))}
                  <Button className="mt-4">Update Preferences</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
