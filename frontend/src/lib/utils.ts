import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getBrandInitials(name: string): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return parts[0][0].toUpperCase();
}

export function getBrandColor(name: string): string {
  const colors = [
    "#2563eb", // blue
    "#059669", // emerald
    "#db2777", // pink
    "#7c3aed", // violet
    "#ea580c", // orange
    "#ca8a04", // yellow
    "#0891b2", // cyan
    "#4f46e5", // indigo
    "#dc2626", // red
  ];
  if (!name) return colors[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export function getFallbackLogo(brandName: string): string {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    brandName
  )}&background=random&color=fff&size=128&bold=true`;
}

export function getAssetUrl(path?: string | null): string {
  if (!path) return "";
  if (path.startsWith("http")) return path;

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000";
  // Remove trailing slash from apiUrl and leading slash from path
  const normalizedApiUrl = apiUrl.endsWith("/") ? apiUrl.slice(0, -1) : apiUrl;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${normalizedApiUrl}${normalizedPath}`;
}
