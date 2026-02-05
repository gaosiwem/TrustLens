"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import InputField from "../InputField";
import { getAssetUrl } from "../../lib/utils";
import { toast } from "sonner";

import { Badge } from "../ui/badge";
import { Shield } from "lucide-react";
import Button from "../Button"; // Assuming Button component exists or use standard button

interface ManagedBrand {
  id: string;
  name: string;
  logoUrl?: string;
  description?: string;
  websiteUrl?: string;
  supportEmail?: string;
  supportPhone?: string;
  subscriptions?: any[];
}

interface EditBrandDialogProps {
  isOpen: boolean;
  onClose: () => void;
  brand: ManagedBrand | null;
  onSuccess: () => void;
}

export default function EditBrandDialog({
  isOpen,
  onClose,
  brand,
  onSuccess,
}: EditBrandDialogProps) {
  const { data: session } = useSession();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    websiteUrl: "",
    supportEmail: "",
    supportPhone: "",
    logoUrl: "",
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [updating, setUpdating] = useState(false);
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    if (brand) {
      setFormData({
        name: brand.name || "",
        description: brand.description || "",
        websiteUrl: brand.websiteUrl || "",
        supportEmail: brand.supportEmail || "",
        supportPhone: brand.supportPhone || "",
        logoUrl: brand.logoUrl || "",
      });
      setLogoFile(null);

      // Check subscription
      const hasPro = brand.subscriptions?.some(
        (sub: any) =>
          sub.status === "ACTIVE" &&
          ["PRO", "BUSINESS", "ENTERPRISE", "PREMIUM_VERIFIED"].includes(
            sub.plan?.code,
          ),
      );
      setIsPro(!!hasPro);
    }
  }, [brand]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brand || !session?.accessToken || updating) return;

    setUpdating(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000";
      const data = new FormData();
      data.append("name", formData.name);
      data.append("websiteUrl", formData.websiteUrl);
      data.append("supportEmail", formData.supportEmail);
      data.append("supportPhone", formData.supportPhone);

      // Only send description if allowed
      if (isPro) {
        data.append("description", formData.description);
      }

      if (logoFile) {
        data.append("logo", logoFile);
      } else {
        data.append("logoUrl", formData.logoUrl);
      }

      await axios.patch(`${apiUrl}/brands/${brand.id}`, data, {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      });

      toast.success("Brand updated successfully!");
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Failed to update brand:", error);
      toast.error(error.response?.data?.error || "Failed to update brand");
    } finally {
      setUpdating(false);
    }
  };

  if (!brand) return null;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => !open && !updating && onClose()}
    >
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Brand Details</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleUpdate} className="space-y-4 pt-4">
          <InputField
            label="Brand Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground tracking-wider flex items-center gap-2">
              Description
              {!isPro && (
                <Badge
                  variant="outline"
                  className="text-[10px] border-primary/20 text-primary bg-primary/5 h-5 px-1.5 gap-1"
                >
                  <Shield className="w-3 h-3" /> PRO
                </Badge>
              )}
            </label>
            <div className="relative">
              <textarea
                className={`w-full min-h-[100px] rounded-lg border p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary ${!isPro ? "opacity-50 cursor-not-allowed bg-muted/20 border-dashed" : "bg-card border-border"}`}
                value={formData.description}
                onChange={(e) =>
                  isPro &&
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Introduce your brand to consumers..."
                disabled={!isPro}
              />
              {!isPro && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold text-muted-foreground bg-background/80 px-3 py-1 rounded-full border border-border shadow-sm">
                    Upgrade to customize
                  </span>
                </div>
              )}
            </div>
          </div>

          <InputField
            label="Website"
            value={formData.websiteUrl}
            onChange={(e) =>
              setFormData({ ...formData, websiteUrl: e.target.value })
            }
            placeholder="brand.com"
          />
          <InputField
            label="Support Phone"
            value={formData.supportPhone}
            onChange={(e) =>
              setFormData({ ...formData, supportPhone: e.target.value })
            }
            placeholder="+27..."
          />
          <InputField
            label="Support Email"
            value={formData.supportEmail}
            onChange={(e) =>
              setFormData({ ...formData, supportEmail: e.target.value })
            }
            placeholder="support@brand.com"
          />

          <div className="space-y-4">
            <label className="text-xs font-bold text-muted-foreground tracking-wider block">
              Brand Logo
            </label>
            <div className="space-y-2">
              <p className="text-[10px] text-muted-foreground italic">
                Choice A: Provide a URL
              </p>
              <input
                type="text"
                className="w-full px-3 py-2 rounded-lg bg-card border border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="https://example.com/logo.png"
                value={formData.logoUrl}
                onChange={(e) => {
                  setFormData({ ...formData, logoUrl: e.target.value });
                  setLogoFile(null);
                }}
              />
            </div>
            <div className="space-y-2">
              <p className="text-[10px] text-muted-foreground italic">
                Choice B: Upload a file
              </p>
              <div className="flex items-center gap-3">
                <label className="cursor-pointer px-4 py-2 bg-muted hover:bg-muted/80 text-foreground text-xs font-bold rounded-lg border border-border transition-colors flex items-center gap-2 shrink-0">
                  <span className="material-symbols-outlined text-lg">
                    upload_file
                  </span>
                  {logoFile ? "Change File" : "Choose File"}
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*,.svg,image/svg+xml"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setLogoFile(file);
                        setFormData({ ...formData, logoUrl: "" });
                      }
                    }}
                  />
                </label>
                {logoFile && (
                  <span className="text-[10px] text-muted-foreground truncate max-w-[150px]">
                    {logoFile.name}
                  </span>
                )}
              </div>
            </div>

            {(formData.logoUrl || logoFile) && (
              <div className="mt-2 p-2 border border-dashed border-border rounded-lg flex items-center gap-3">
                <div className="w-16 h-16 rounded-lg bg-white border border-border overflow-hidden shadow-sm">
                  <img
                    src={
                      logoFile
                        ? URL.createObjectURL(logoFile)
                        : getAssetUrl(formData.logoUrl)
                    }
                    alt="Preview"
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="text-xs text-muted-foreground">
                  Logo Preview
                </span>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-lg transition-colors"
              disabled={updating}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updating}
              className="px-6 py-2 bg-primary text-primary-foreground text-sm font-bold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {updating ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
