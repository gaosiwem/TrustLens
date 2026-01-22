"use client";

import { useState, useEffect, useRef } from "react";
import { Search, BadgeCheck, X, Check } from "lucide-react";
import BrandLogo from "./BrandLogo";
import InputField from "./InputField";

interface BrandResult {
  id: string;
  name: string;
  isVerified: boolean;
  logoUrl?: string;
  complaintCount?: number;
}

interface BrandAutocompleteProps {
  label?: string;
  placeholder?: string;
  error?: string;
  onSelect: (brandName: string) => void;
  onSelectBrand?: (brand: BrandResult | null) => void;
  defaultValue?: string;
}

export default function BrandAutocomplete({
  label = "Brand Name",
  placeholder = "Search for a company...",
  error,
  onSelect,
  onSelectBrand,
  defaultValue = "",
}: BrandAutocompleteProps) {
  const [query, setQuery] = useState(defaultValue);
  const [results, setResults] = useState<BrandResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<BrandResult | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(async () => {
      // Don't search if query is same as selected brand name
      if (
        query.trim().length < 2 ||
        (selectedBrand && selectedBrand.name === query)
      ) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000";
        const res = await fetch(
          `${apiUrl}/brands/public/search?q=${encodeURIComponent(query)}`,
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
  }, [query, selectedBrand]);

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

  const handleSelect = (brand: BrandResult) => {
    setQuery(brand.name);
    setSelectedBrand(brand);
    onSelect(brand.name);
    onSelectBrand?.(brand);
    setShowDropdown(false);
    setResults([]);
  };

  const handleClear = () => {
    setQuery("");
    setSelectedBrand(null);
    onSelect("");
    onSelectBrand?.(null);
    setShowDropdown(false);
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div className="relative">
        <InputField
          type="text"
          label={label}
          value={query}
          onChange={(e) => {
            const val = e.target.value;
            setQuery(val);
            onSelect(val); // Always update form value
            if (val.length > 0) setShowDropdown(true);
            if (selectedBrand && val !== selectedBrand.name) {
              setSelectedBrand(null);
            }
          }}
          placeholder={placeholder}
          error={error}
          icon={
            selectedBrand ? (
              <BadgeCheck className="w-5 h-5 text-primary fill-primary/10" />
            ) : (
              <Search className="w-5 h-5 text-muted-foreground" />
            )
          }
          className={`pr-10 ${selectedBrand ? "border-primary/30 ring-primary/10" : ""}`}
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-[38px] text-muted-foreground hover:text-foreground transition-colors p-1"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Dropdown Results */}
      {showDropdown && (query.length >= 2 || results.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card rounded-2xl border border-border shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {loading ? (
            <div className="p-5 text-center text-muted-foreground font-medium flex items-center justify-center gap-3">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs uppercase tracking-widest font-bold">
                Scanning Brands...
              </span>
            </div>
          ) : results.length > 0 ? (
            <div className="max-h-64 overflow-y-auto custom-scrollbar">
              <div className="px-4 py-2 text-[10px] font-black text-muted-foreground/60 tracking-[0.2em] bg-muted/20 uppercase border-b border-border/50">
                Found in Industry Directory
              </div>
              {results.map((brand) => (
                <div
                  key={brand.id}
                  onClick={() => handleSelect(brand)}
                  className="flex items-center gap-4 p-4 hover:bg-primary/5 cursor-pointer transition-all border-b last:border-0 border-border/40 group"
                >
                  <div className="relative">
                    <BrandLogo
                      brandName={brand.name}
                      brandLogoUrl={brand.logoUrl}
                      className="w-10 h-10 rounded-xl shadow-sm group-hover:scale-105 transition-transform"
                    />
                    {brand.isVerified && (
                      <div className="absolute -top-1 -right-1 bg-background rounded-full p-0.5 shadow-sm">
                        <BadgeCheck className="w-3.5 h-3.5 text-white fill-primary" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-foreground truncate group-hover:text-primary transition-colors">
                        {brand.name}
                      </h4>
                      {/* {brand.isVerified && (
                        <span className="px-1.5 py-0.5 rounded-md bg-primary/10 text-[8px] font-black text-primary uppercase tracking-tighter">
                          Verified
                        </span>
                      )} */}
                    </div>
                    <p className="text-[10px] text-muted-foreground font-bold mt-0.5">
                      {brand.complaintCount || 0} Reports • AI Monitored
                    </p>
                  </div>
                  <div className="h-8 w-8 rounded-full border border-border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-background">
                    <Check className="w-4 h-4 text-primary" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-muted/10">
              <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto mb-4 border border-border shadow-inner">
                <Search className="w-7 h-7 text-muted-foreground/20" />
              </div>
              <p className="font-bold text-sm text-foreground">
                No official matches
              </p>
              <p className="text-[11px] text-muted-foreground mt-2 max-w-[200px] mx-auto leading-relaxed">
                You can still manually enter "
                <span className="text-foreground font-bold italic">
                  {query}
                </span>
                " and proceed.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
