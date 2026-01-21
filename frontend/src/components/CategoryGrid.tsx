"use client";

import Link from "next/link";
import { useRef } from "react";
import { Button } from "../components/ui/button";
import { CATEGORY_DATA } from "../data/categories";

const CategoryGrid = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 340;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="py-20 lg:py-24 relative overflow-hidden bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 gap-6">
          <div className="text-left">
            <h2 className="text-2xl sm:text-3xl font-black mb-2 tracking-tight">
              Explore by <span className="text-primary italic">Category</span>
            </h2>
            <p className="text-muted-foreground text-xs sm:text-sm max-w-md">
              Find the most trusted businesses across every industry in South
              Africa.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/categories">
              <Button
                variant="outline"
                size="sm"
                className="font-bold rounded-xl border-primary/20 hover:border-primary/50 hover:bg-primary/5 text-primary h-10 px-6 hidden sm:flex items-center gap-2"
              >
                Explore All
                <span className="material-symbols-outlined text-[18px]">
                  grid_view
                </span>
              </Button>
            </Link>

            <div className="flex items-center gap-2">
              <button
                onClick={() => scroll("left")}
                className="w-9 h-9 rounded-xl bg-card border border-border flex items-center justify-center hover:bg-primary/5 hover:border-primary/30 transition-all active:scale-90 shadow-sm group"
                aria-label="Scroll Left"
              >
                <span className="material-symbols-outlined text-primary text-xl group-hover:scale-110 transition-transform">
                  chevron_left
                </span>
              </button>
              <button
                onClick={() => scroll("right")}
                className="w-9 h-9 rounded-xl bg-card border border-border flex items-center justify-center hover:bg-primary/5 hover:border-primary/30 transition-all active:scale-90 shadow-sm group"
                aria-label="Scroll Right"
              >
                <span className="material-symbols-outlined text-primary text-xl group-hover:scale-110 transition-transform">
                  chevron_right
                </span>
              </button>
            </div>
          </div>
        </div>

        <div className="relative">
          <div
            ref={scrollRef}
            className="flex overflow-x-auto gap-5 pb-6 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide snap-x snap-mandatory scroll-smooth"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {CATEGORY_DATA.map((cat) => (
              <div
                key={cat.id}
                className="shrink-0 w-[260px] sm:w-[300px] snap-start group p-5 rounded-2xl bg-card border border-border hover:border-primary/40 transition-all duration-500 shadow-sm hover:shadow-xl hover:shadow-primary/5 flex flex-col"
              >
                <header className="flex items-center gap-3 mb-4 border-b border-border pb-4 group-hover:border-primary/10 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                    <span className="material-symbols-outlined text-primary text-xl variation-fill">
                      {cat.icon}
                    </span>
                  </div>
                  <h3 className="text-base font-black tracking-tight">
                    {cat.name}
                  </h3>
                </header>

                <ul className="space-y-2">
                  <li className="mb-0.5">
                    <Link
                      href={`/complaints?category=${cat.slug}`}
                      className="group/link inline-flex items-center gap-1.5 text-[11px] font-black text-primary hover:translate-x-1 transition-all tracking-wider"
                    >
                      All {cat.name}
                      <span className="material-symbols-outlined text-[12px]">
                        arrow_forward
                      </span>
                    </Link>
                  </li>
                  {cat.subcategories.map((sub) => (
                    <li key={sub.slug}>
                      <Link
                        href={`/complaints?category=${sub.slug}`}
                        className="text-muted-foreground hover:text-primary transition-colors text-[12px] font-semibold block border-l-2 border-transparent hover:border-primary/30 pl-2.5 -ml-px"
                      >
                        {sub.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Faint Edge Fades */}
          <div className="absolute top-0 left-0 w-8 h-full bg-linear-to-r from-background to-transparent pointer-events-none opacity-50 sm:hidden" />
          <div className="absolute top-0 right-0 w-8 h-full bg-linear-to-l from-background to-transparent pointer-events-none opacity-50 sm:hidden" />
        </div>

        <div className="mt-10 sm:hidden">
          <Link href="/categories">
            <Button className="w-full font-bold h-12 rounded-xl flex items-center justify-center gap-2">
              Explore All Categories
              <span className="material-symbols-outlined text-[20px]">
                grid_view
              </span>
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CategoryGrid;
