import Link from "next/link";
import { Search } from "lucide-react";
import { PageHeader } from "@/components/marketing/page-header";
import { ProductCard } from "@/components/shop/product-card";
import { Input } from "@/components/ui/input";
import { listCategories, listProducts } from "@/server/services/store";
import { cn } from "@/lib/utils";

export const metadata = { title: "Performance Store" };

export default async function ShopPage({ searchParams }: { searchParams: { q?: string; category?: string } }) {
  const [products, categories] = await Promise.all([listProducts({ q: searchParams.q, category: searchParams.category }), listCategories()]);
  return (
    <>
      <PageHeader eyebrow="Performance store" title="Fuel, gear & recovery." description="Lab-tested supplements and training gear. Premium members save 10%, VIP members 20% — automatically at checkout." image="/images/site/fitness4.jpg" />
      <section className="container-x py-12">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {[{ name: "All" }, ...categories].map((c) => {
              const active = c.name === "All" ? !searchParams.category : searchParams.category === c.name;
              return (
                <Link key={c.name} href={c.name === "All" ? "/shop" : `/shop?category=${encodeURIComponent(c.name)}`} className={cn("rounded-full border px-4 py-1.5 text-sm transition", active ? "border-primary bg-primary text-primary-foreground" : "hover:border-primary/50")}>
                  {c.name}
                </Link>
              );
            })}
          </div>
          <form className="relative w-full lg:w-80">
            {searchParams.category && <input type="hidden" name="category" value={searchParams.category} />}
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input name="q" defaultValue={searchParams.q} placeholder="Search products…" className="h-10 rounded-full pl-9" />
          </form>
        </div>
        {products.length === 0 ? (
          <p className="py-20 text-center text-muted-foreground">No products match your search.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {products.map((p) => <ProductCard key={p.slug} product={p} />)}
          </div>
        )}
      </section>
    </>
  );
}
