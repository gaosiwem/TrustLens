import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import Button from "@/components/Button";
import InputField from "@/components/InputField";
import { toast } from "sonner";
import {
  AppWindow,
  Globe,
  Lock,
  Palette,
  Eye,
  CheckCircle2,
  Copy,
  Type,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function WidgetSettings() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  // @ts-ignore
  const brandId = session?.user?.brandId;

  const [settings, setSettings] = useState({
    allowedDomains: [] as string[],
    widgetWatermark: true,
    widgetWatermarkText: "" as string | null, // Add initial state
    widgetRoutingEnabled: true,
    defaultTheme: "light",
    widgetPlan: "FREE",
    slug: "",
    widgetStyles: {
      primaryColor: "#0F172A", // Default slate-900
      starColor: "#E11D48", // Default pink/red
      fontFamily: "Inter",
    } as any,
  });

  const [keys, setKeys] = useState<any[]>([]);
  const [newDomain, setNewDomain] = useState("");

  useEffect(() => {
    if (!brandId) return;

    // Fetch brand data to populate settings
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/brands/${brandId}`, {
      headers: { Authorization: `Bearer ${session?.accessToken}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setSettings({
          allowedDomains: data.allowedDomains || [],
          widgetWatermark: data.widgetWatermark ?? true,
          widgetWatermarkText: data.widgetWatermarkText || "", // Add fetching
          widgetRoutingEnabled: data.widgetRoutingEnabled ?? true,
          defaultTheme: data.defaultTheme || "light",
          widgetPlan: data.widgetPlan || "FREE",
          slug: data.slug || "",
          widgetStyles: data.widgetStyles || {
            primaryColor: "#0F172A",
            starColor: "#E11D48",
            fontFamily: "Inter",
          },
        });
        setKeys(data.widgetKeys || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [brandId, session]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/brands/${brandId}/widget-settings`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.accessToken}`,
          },
          body: JSON.stringify({
            allowedDomains: settings.allowedDomains,
            widgetWatermark: settings.widgetWatermark,
            widgetWatermarkText: settings.widgetWatermarkText, // Add to save body
            widgetRoutingEnabled: settings.widgetRoutingEnabled,
            defaultTheme: settings.defaultTheme,
            widgetStyles: settings.widgetStyles,
          }),
        },
      );

      if (res.ok) {
        toast.success("Widget settings saved!");
      } else {
        toast.error("Failed to save settings.");
      }
    } catch (e) {
      toast.error("Error saving settings.");
    } finally {
      setSaving(false);
    }
  };

  const addDomain = () => {
    if (!newDomain) return;
    // Basic validation
    let domain = newDomain.trim().toLowerCase();
    try {
      const url = new URL(
        domain.startsWith("http") ? domain : `https://${domain}`,
      );
      domain = url.host;
    } catch {
      // use raw if URL parse fails but unlikely if typed somewhat correctly
    }

    if (settings.allowedDomains.includes(domain)) {
      setNewDomain("");
      return;
    }

    setSettings({
      ...settings,
      allowedDomains: [...settings.allowedDomains, domain],
    });
    setNewDomain("");
  };

  const removeDomain = (d: string) => {
    setSettings({
      ...settings,
      allowedDomains: settings.allowedDomains.filter((x) => x !== d),
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const handleGenerateKey = async () => {
    if (!brandId) {
      toast.error("Brand ID missing.");
      return;
    }
    const url = `${process.env.NEXT_PUBLIC_API_URL}/brands/${brandId}/widget-keys`;
    console.log("DEBUG: Generating key at", url);

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${session?.accessToken}` },
      });
      console.log("DEBUG: Response status:", res.status, res.statusText);

      const data = await res.json();
      if (res.ok) {
        setKeys([...keys, data.key]);
        toast.success("New widget key generated.");
      } else {
        console.error("Generate key failed:", data);
        toast.error(`Failed: ${data.error || "Unknown error"}`);
      }
    } catch (e) {
      console.error(e);
      toast.error("Error generating key.");
    }
  };

  const updateStyle = (key: string, value: string) => {
    setSettings({
      ...settings,
      widgetStyles: {
        ...settings.widgetStyles,
        [key]: value,
      },
    });
  };

  if (loading) return <div>Loading settings...</div>;

  const isFree = settings.widgetPlan === "FREE";

  // Widget Embed Code
  const embedUrl = `http://localhost:3000/widgets/reputation-summary?brand=${settings.slug}&theme=${settings.defaultTheme}${!isFree ? "&key=YOUR_KEY" : ""}`;
  const embedCode = `<iframe src="${embedUrl}" style="border:0;width:100%;height:720px;border-radius:16px;overflow:hidden;" loading="lazy"></iframe>`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AppWindow className="w-5 h-5 text-primary" />
              Widget Configuration
            </CardTitle>
            <CardDescription>
              Control how your trust widgets appear and behave on external
              sites.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Enable/Disable */}
            <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card">
              <div className="space-y-1">
                <div className="font-bold flex items-center gap-2">
                  Enable Widgets
                  {settings.widgetRoutingEnabled && (
                    <Badge
                      variant="outline"
                      className="bg-green-50 text-green-700 border-green-200"
                    >
                      Active
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Allow widgets to serve data.
                </p>
              </div>
              <Switch
                checked={settings.widgetRoutingEnabled}
                onChange={(v) =>
                  setSettings({ ...settings, widgetRoutingEnabled: v })
                }
              />
            </div>

            {/* Theme */}
            <div className="space-y-3">
              <label className="text-sm font-bold flex items-center gap-2">
                <Palette className="w-4 h-4 text-muted-foreground" />
                Default Theme
              </label>
              <div className="flex gap-4">
                <button
                  onClick={() =>
                    setSettings({ ...settings, defaultTheme: "light" })
                  }
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border w-24 transition-all ${settings.defaultTheme === "light" ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border hover:bg-muted/50"}`}
                >
                  <div className="w-full h-12 bg-white rounded border shadow-sm" />
                  <span className="text-xs font-semibold">Light</span>
                </button>
                <button
                  onClick={() =>
                    setSettings({ ...settings, defaultTheme: "dark" })
                  }
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border w-24 transition-all ${settings.defaultTheme === "dark" ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border hover:bg-muted/50"}`}
                >
                  <div className="w-full h-12 bg-slate-900 rounded border shadow-sm" />
                  <span className="text-xs font-semibold">Dark</span>
                </button>
              </div>
            </div>

            {/* Custom Styling (Business/Enterprise) */}
            <div className="space-y-4 pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold flex items-center gap-2">
                  <Type className="w-4 h-4 text-muted-foreground" />
                  Custom Appearance
                </label>
                {["BUSINESS", "ENTERPRISE"].includes(settings.widgetPlan) ? (
                  <Badge
                    variant="outline"
                    className="bg-blue-50 text-blue-700 border-blue-200"
                  >
                    Business Feature
                  </Badge>
                ) : (
                  <Badge variant="destructive">Business & Enterprise</Badge>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">
                    Brand Color (Headings)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      disabled={
                        !["BUSINESS", "ENTERPRISE"].includes(
                          settings.widgetPlan,
                        )
                      }
                      value={settings.widgetStyles?.primaryColor || "#0F172A"}
                      onChange={(e) =>
                        updateStyle("primaryColor", e.target.value)
                      }
                      className="h-10 w-14 rounded border border-border cursor-pointer p-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <span className="text-xs font-mono">
                      {settings.widgetStyles?.primaryColor || "#0F172A"}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">
                    Star Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      disabled={
                        !["BUSINESS", "ENTERPRISE"].includes(
                          settings.widgetPlan,
                        )
                      }
                      value={settings.widgetStyles?.starColor || "#E11D48"}
                      onChange={(e) => updateStyle("starColor", e.target.value)}
                      className="h-10 w-14 rounded border border-border cursor-pointer p-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <span className="text-xs font-mono">
                      {settings.widgetStyles?.starColor || "#E11D48"}
                    </span>
                  </div>
                </div>
                <div className="space-y-2 col-span-2">
                  <label className="text-xs font-medium text-muted-foreground">
                    Font Family
                  </label>
                  <select
                    disabled={
                      !["BUSINESS", "ENTERPRISE"].includes(settings.widgetPlan)
                    }
                    value={settings.widgetStyles?.fontFamily || "Inter"}
                    onChange={(e) => updateStyle("fontFamily", e.target.value)}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="Inter">Inter (Default)</option>
                    <option value="Roboto">Roboto</option>
                    <option value="Open Sans">Open Sans</option>
                    <option value="Merriweather">Merriweather (Serif)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Watermark (Pro only feature gating visual) */}
            <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card">
              <div className="space-y-1">
                <div className="font-bold flex items-center gap-2">
                  Branding & Watermark
                  {isFree ? (
                    <Badge variant="secondary" className="text-xs">
                      Free Plan
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="text-xs bg-purple-50 text-purple-700 border-purple-200"
                    >
                      Unlocked
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {isFree
                    ? 'Show "Powered by TrustLens" watermark.'
                    : "Show a custom brand label or the default platform badge in the footer."}
                </p>
              </div>
              {isFree ? (
                <div className="text-xs text-muted-foreground italic flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Required on Free Plan
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground mr-2">
                    {settings.widgetWatermark ? "Visible" : "Hidden"}
                  </span>
                  <Switch
                    checked={settings.widgetWatermark}
                    onChange={(v) =>
                      setSettings({ ...settings, widgetWatermark: v })
                    }
                  />
                </div>
              )}
            </div>

            {/* Custom Watermark Text (Pro+) */}
            {settings.widgetWatermark && !isFree && (
              <div className="pt-2 pl-4 border-l-2 border-border ml-1">
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Custom Footer Label{" "}
                  <span className="text-xs text-muted-foreground/50">
                    (e.g. "Powered by [Your Brand]")
                  </span>
                </label>
                <div className="max-w-md">
                  <InputField
                    placeholder="e.g. Powered by My Brand"
                    value={settings.widgetWatermarkText || ""}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        widgetWatermarkText: e.target.value,
                      })
                    }
                    wrapperClassName="w-full"
                  />
                </div>
              </div>
            )}

            {/* Allowed Domains */}
            <div className="space-y-3 pt-4 border-t border-border">
              <label className="text-sm font-bold flex items-center gap-2">
                <Globe className="w-4 h-4 text-muted-foreground" />
                Allowed Domains
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 w-full max-w-2xl items-center">
                <InputField
                  placeholder="example.com"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  wrapperClassName="w-full"
                />

                <Button
                  onClick={addDomain}
                  variant="outline"
                  className="h-10 px-4 sm:w-auto w-full"
                >
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {settings.allowedDomains.map((d) => (
                  <div
                    key={d}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted text-xs font-medium"
                  >
                    <ShieldIcon className="w-3 h-3 text-green-600" />
                    {d}
                    <button
                      onClick={() => removeDomain(d)}
                      className="text-muted-foreground hover:text-destructive ml-1"
                    >
                      ×
                    </button>
                  </div>
                ))}
                {settings.allowedDomains.length === 0 && (
                  <p className="text-xs text-muted-foreground italic">
                    No specific domains allowed. (Recommended to restrict to
                    your sites)
                  </p>
                )}
              </div>
            </div>

            <div className="pt-4">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="w-full sm:w-auto"
              >
                {saving ? "Saving Changes..." : "Save Configuration"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* API Keys (If not Free) */}
        {!isFree && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-primary" />
                Widget Keys
              </CardTitle>
              <CardDescription>
                Secure keys required for business widget features.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {keys.map((k) => (
                  <div
                    key={k.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20"
                  >
                    <div className="font-mono text-sm text-slate-600 dark:text-slate-400">
                      {k.key}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={k.isActive ? "outline" : "destructive"}>
                        {k.isActive ? "Active" : "Revoked"}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(k.key)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {keys.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No keys generated.
                  </p>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-2"
                  onClick={handleGenerateKey}
                  disabled={loading || keys.length >= 3}
                >
                  Generate New Key
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div>
        {/* Preview Card */}
        <Card className="sticky top-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary" />
              Embed Preview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Embed Code
              </label>
              <div className="relative group">
                <pre className="p-4 rounded-xl bg-slate-950 text-slate-50 text-xs overflow-x-auto whitespace-pre-wrap font-mono relative">
                  {embedCode}
                </pre>
                <button
                  onClick={() => copyToClipboard(embedCode)}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="pt-6 border-t border-border">
              <div className="text-xs text-center text-muted-foreground mb-4">
                Preview (Live)
              </div>
              <div
                className={`w-full aspect-[4/5] rounded-xl border-4 border-muted overflow-hidden bg-gray-50 dark:bg-gray-900 ${settings.defaultTheme === "dark" ? "dark" : ""}`}
              >
                {!isFree && keys.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-destructive p-6 text-center text-sm font-medium bg-destructive/5">
                    <div className="space-y-3">
                      <Lock className="w-12 h-12 mx-auto" />
                      <p>
                        Widget Key Required & Missing.
                        <br />
                        Please generate a key above to view.
                      </p>
                    </div>
                  </div>
                ) : settings.slug ? (
                  <iframe
                    src={`http://localhost:3000/widgets/reputation-summary?brand=${settings.slug}&theme=${settings.defaultTheme}${!isFree && keys.length > 0 ? `&key=${keys.find((k: any) => k.isActive)?.key || ""}` : ""}`}
                    className="w-full h-full border-0"
                    title="Widget Preview"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground p-6 text-center text-sm opacity-50">
                    <div className="space-y-3">
                      <AppWindow className="w-12 h-12 mx-auto" />
                      <p className="items-center">
                        Widget will appear here after saving settings.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Helper components
function Switch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div
      onClick={() => onChange(!checked)}
      className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${checked ? "bg-primary" : "bg-muted border border-border"}`}
    >
      <div
        className={`absolute top-1 w-4 h-4 rounded-full transition-all shadow-sm bg-white ${checked ? "left-7" : "left-1"}`}
      />
    </div>
  );
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
    </svg>
  );
}
