"use client";

import { useState, useEffect, useRef } from "react";
import { Search, BadgeCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import BrandLogo from "./BrandLogo";
import InputField from "./InputField";

interface BrandResult {
  id: string;
  name: string;
  isVerified: boolean;
  logoUrl?: string;
  complaintCount?: number;
}

export default function BrandSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<BrandResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length < 2) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000";
        const res = await fetch(
          `${apiUrl}/brands/public/search?q=${encodeURIComponent(query)}`
        );
        if (res.ok) {
          const data = await res.json();
          setResults(data);
          setShowDropdown(true);
        }
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside handler
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (brandId: string) => {
    router.push(`/brands/${brandId}`);
    setShowDropdown(false);
  };

  return (
    <div className="relative w-full max-w-xl mx-auto" ref={dropdownRef}>
      <InputField
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          if (e.target.value.length > 0) setShowDropdown(true);
        }}
        placeholder="Search for a company..."
        icon={<Search className="w-6 h-6" />}
        className="h-14 rounded-2xl text-lg font-medium shadow-sm placeholder:text-muted-foreground/70"
        style={{ outline: "none", boxShadow: "none" }}
      />

      {/* Dropdown Results */}
      {showDropdown && (query.length >= 2 || results.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card rounded-2xl border border-border shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {loading ? (
            <div className="p-4 text-center text-muted-foreground font-medium animate-pulse">
              Searching...
            </div>
          ) : results.length > 0 ? (
            <div className="max-h-80 overflow-y-auto">
              <div className="px-3 py-2 text-xs font-bold text-muted-foreground tracking-widest bg-muted/30">
                Brands Found
              </div>
              {results.map((brand) => (
                <div
                  key={brand.id}
                  onClick={() => handleSelect(brand.id)}
                  className="flex items-center gap-4 p-4 hover:bg-muted/50 cursor-pointer transition-colors border-b last:border-0 border-border"
                >
                  <BrandLogo
                    brandName={brand.name}
                    brandLogoUrl={brand.logoUrl}
                    className="w-10 h-10 rounded-lg"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-foreground truncate">
                        {brand.name}
                      </h4>
                      {brand.isVerified && (
                        <BadgeCheck className="w-5 h-5 text-white fill-primary" />
                      )}
                    </div>
                    {brand.complaintCount !== undefined && (
                      <p className="text-xs text-muted-foreground font-medium">
                        {brand.complaintCount} Complaints
                      </p>
                    )}
                  </div>
                  <span className="material-symbols-outlined text-muted-foreground opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all">
                    chevron_right
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center">
              <span className="material-symbols-outlined text-4xl text-muted-foreground/30 mb-2">
                search_off
              </span>
              <p className="font-bold text-muted-foreground">No brands found</p>
              <p className="text-xs text-muted-foreground/80 mt-1">
                Try searching for another company or check the spelling.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
