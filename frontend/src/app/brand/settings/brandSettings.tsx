import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { FeatureGate } from "@/components/subscription/FeatureGate";
import TeamManagementWidget from "@/components/brand/TeamManagementWidget";
import SLAConfigWidget from "@/components/brand/SLAConfigWidget";
import WidgetSettings from "@/components/brand/WidgetSettings";
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
  Users,
  Building,
  Bell,
  Shield,
  Camera,
  Link as LinkIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

import { toast } from "sonner";

export default function BrandSettings() {
  const { data: session } = useSession();
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [brandName, setBrandName] = useState("");
  const [website, setWebsite] = useState("");
  const [description, setDescription] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [brandId, setBrandId] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user) {
      setUserName(session.user.name || "");
      setEmail(session.user.email || "");
      // @ts-ignore
      const activeBrandId = session.user.brandId;

      if (activeBrandId) {
        setBrandId(activeBrandId);
        // Fetch brand data
        fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/brands/public/${activeBrandId}`,
        )
          .then((res) => res.json())
          .then((data) => {
            setBrandName(data.name || "");
            setWebsite(data.websiteUrl || "");
            setDescription(data.description || "");
            setLogoUrl(data.logoUrl || "");

            // Check subscription
            const hasPro = data.subscriptions?.some(
              (sub: any) =>
                sub.status === "ACTIVE" &&
                ["PRO", "BUSINESS", "ENTERPRISE", "PREMIUM_VERIFIED"].includes(
                  sub.plan.code,
                ),
            );
            setIsPro(!!hasPro);
          })
          .catch((err) => console.error("Failed to fetch brand:", err));
      }
    }
  }, [session]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandId) return;

    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/brands/${brandId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.accessToken}`,
          },
          body: JSON.stringify({
            name: brandName,
            websiteUrl: website,
            description: isPro ? description : undefined, // Don't send if not allowed, though backend blocks it too
          }),
        },
      );

      if (res.ok) {
        toast.success("Brand settings updated successfully!");
      } else {
        const err = await res.json();
        toast.error(
          "An error occurred while updating settings. Please try again.",
        );
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
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
        <TabsTrigger value="widgets" className="flex items-center gap-2 px-6">
          <LinkIcon className="w-4 h-4" />
          Widgets
        </TabsTrigger>
        <TabsTrigger value="team" className="flex items-center gap-2 px-6">
          <Users className="w-4 h-4" />
          Team & SLAs
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
            <form className="space-y-6 max-w-2xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                  label="Full Name"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Your full name"
                />
                <InputField label="Business Email" value={email} disabled />
              </div>
              <Button disabled className="px-8 cursor-not-allowed opacity-70">
                Managed by Admin
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
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt="Brand Logo"
                      className="w-full h-full object-contain p-2"
                    />
                  ) : (
                    <Building className="w-10 h-10 text-muted-foreground group-hover:opacity-20 transition-opacity" />
                  )}
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
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold flex items-center gap-2">
                      Brand Biography
                      {!isPro && (
                        <Badge
                          variant="outline"
                          className="text-[10px] border-primary/20 text-primary bg-primary/5 h-5 px-1.5 gap-1"
                        >
                          <Shield className="w-3 h-3" /> PRO
                        </Badge>
                      )}
                    </label>
                  </div>
                  <div className="relative">
                    <textarea
                      className={`w-full h-32 bg-background border rounded-xl p-4 text-sm focus:ring-2 focus:ring-primary focus:outline-none transition-all ${!isPro ? "opacity-50 cursor-not-allowed bg-muted/20" : "border-border"}`}
                      placeholder={
                        isPro
                          ? "Tell consumers about your commitment to trust..."
                          : "Upgrade to PRO to customize your brand biography."
                      }
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      disabled={!isPro}
                    />
                    {!isPro && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Button
                          type="button"
                          variant="outline"
                          className="shadow-sm border border-border bg-white/80 backdrop-blur-sm hover:bg-white"
                          onClick={() =>
                            (window.location.href = "/brand/subscription")
                          }
                        >
                          Upgrade to Unlock
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                <Button type="submit" className="px-8" disabled={loading}>
                  {loading ? "Saving..." : "Update Assets"}
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="notifications">
        <AlertPreferencesSettings session={session} />
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

      <TabsContent value="widgets">
        <WidgetSettings />
      </TabsContent>

      <TabsContent value="team">
        <FeatureGate feature="teamSLA">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TeamManagementWidget />
            <SLAConfigWidget />
          </div>
        </FeatureGate>
      </TabsContent>
    </Tabs>
  );
}

function AlertPreferencesSettings({ session }: { session: any }) {
  const [prefs, setPrefs] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch preferences on mount (assuming brandId is available in session or can be derived)
  // For this example, we'll try to find the brand ID from the session or fallback
  const brandId = session?.user?.brandId; // Adjust based on actual session shape

  useEffect(() => {
    if (!brandId) return;

    fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/brands/${brandId}/alert-preferences`,
      {
        headers: {
          Authorization: `Bearer ${session.accessToken}`, // Ensure you have the token
        },
      },
    )
      .then((res) => res.json())
      .then((data) => {
        setPrefs(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch prefs:", err);
        setLoading(false);
      });
  }, [brandId, session]);

  const togglePref = async (key: string) => {
    if (!prefs) return;
    const newVal = !prefs[key];
    setPrefs({ ...prefs, [key]: newVal });

    // Auto-save or wait for save button? Let's auto-save for better UX or use a save button.
    // The previous design used a Save button. Let's stick to state update and manual save.
  };

  const handleSave = async () => {
    if (!brandId || !prefs) return;
    setSaving(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/brands/${brandId}/alert-preferences`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.accessToken}`,
          },
          body: JSON.stringify(prefs),
        },
      );
      if (res.ok) {
        toast.success("Preferences saved successfully!");
      } else {
        toast.error("Something went wrong while saving preferences.");
      }
    } catch (e) {
      console.error(e);
      toast.error("An error occurred. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (!brandId) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-destructive">
            Your account is not linked to a brand.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">Loading preferences...</CardContent>
      </Card>
    );
  }

  const items = [
    {
      key: "complaintCreated",
      title: "New Complaint Alerts",
      desc: "Get notified immediately when a consumer files a complaint.",
    },
    {
      key: "statusChanges",
      title: "Status Change Alerts",
      desc: "Get notified when a complaint status changes (e.g. Responded, Resolved).",
    },
    {
      key: "escalations",
      title: "Escalation Alerts",
      desc: "Get notified when a complaint is escalated to TrustLens staff.",
    },
    {
      key: "newMessages",
      title: "New Message Alerts",
      desc: "Get notified when a consumer responds to a complaint.",
    },
    {
      key: "evidenceAdded",
      title: "Evidence Alerts",
      desc: "Get notified when new evidence is attached to a complaint.",
    },
    {
      key: "dailyDigestEnabled",
      title: "Daily Digest",
      desc: "Receive a daily summary of all activity.",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Brand Alert Preferences</CardTitle>
        <CardDescription>
          Configure how your team receives complaint and review alerts.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6 max-w-2xl">
          {items.map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between p-4 rounded-xl hover:bg-muted/50 transition-colors"
            >
              <div className="space-y-1">
                <p className="text-sm font-bold">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              <div
                onClick={() => togglePref(item.key)}
                className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${
                  prefs[item.key]
                    ? "bg-primary"
                    : "bg-muted border border-border"
                }`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 rounded-full transition-all shadow-sm bg-white ${
                    prefs[item.key] ? "left-7" : "left-1"
                  }`}
                />
              </div>
            </div>
          ))}
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Alert Settings"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
