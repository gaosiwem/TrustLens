import Link from "next/link";
import { Button } from "../../components/ui/button";
import { CATEGORY_DATA } from "../../data/categories";
import PublicHeader from "../../components/PublicHeader";

export default function CategoriesPage() {
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader transparent={true} />

      <main className="pt-24 sm:pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] sm:text-xs font-bold mb-4 sm:mb-6">
              <span className="material-symbols-outlined text-sm">
                grid_view
              </span>
              Industry Directory
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-4 sm:mb-6 leading-tight text-foreground">
              Explore by <span className="text-primary italic">Industry</span>
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl">
              From Finance to Automotive, find every sector in the South African
              market. Drill down into subcategories to find the exact service
              you're looking for.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {CATEGORY_DATA.map((category) => (
              <div
                key={category.id}
                className="group p-6 sm:p-7 rounded-4xl bg-card border border-border hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 flex flex-col h-full"
              >
                <div className="flex items-center gap-4 mb-6 sm:mb-8">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                    <span className="material-symbols-outlined text-primary text-2xl variation-fill">
                      {category.icon}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-black tracking-tight group-hover:text-primary transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-[10px] font-bold text-muted-foreground tracking-widest mt-1">
                      {category.subcategories.length} Subcategories
                    </p>
                  </div>
                </div>

                <div className="space-y-2 mb-8 grow">
                  {category.subcategories.map((sub) => (
                    <Link
                      key={sub.slug}
                      href={`/complaints?category=${sub.slug}`}
                      className="flex items-center justify-between p-3.5 rounded-xl bg-muted/30 hover:bg-primary/5 hover:translate-x-1 transition-all group/sub"
                    >
                      <span className="text-[13px] font-bold text-foreground/80 group-hover/sub:text-primary transition-colors">
                        {sub.name}
                      </span>
                      <span className="material-symbols-outlined text-[16px] text-muted-foreground opacity-0 group-hover/sub:opacity-100 transition-all -translate-x-2 group-hover/sub:translate-x-0">
                        chevron_right
                      </span>
                    </Link>
                  ))}
                </div>

                <Link
                  href={`/complaints?category=${category.slug}`}
                  className="mt-auto"
                >
                  <Button className="w-full font-black h-12 rounded-xl text-md group-hover:scale-[1.01] transition-transform">
                    View All {category.name}
                  </Button>
                </Link>
              </div>
            ))}
          </div>

          <div className="mt-24 sm:mt-32 p-10 sm:p-16 rounded-[3rem] bg-muted/30 border border-border text-center overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px] -mr-32 -mt-32" />
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-black mb-6">
                Can't find what you're looking for?
              </h2>
              <p className="text-muted-foreground mb-10 max-w-xl mx-auto font-medium">
                Our AI-integrated search can help you find brands regardless of
                their category. Try searching for a brand name directly.
              </p>
              <Link href="/">
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-2xl font-bold h-16 px-10 border-2"
                >
                  Go back to Search
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-12 border-t border-border bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-muted-foreground font-bold tracking-widest ">
          &copy; {new Date().getFullYear()} TrustLens Technologies • Global
          Accountability
        </div>
      </footer>
    </div>
  );
}
