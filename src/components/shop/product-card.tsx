import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export type ProductCardData = { slug: string; name: string; brand: string | null; category: string | null; price: number; stock: number; image: string; attributes: unknown };

export function ProductCard({ product }: { product: ProductCardData }) {
  const attrs = (product.attributes ?? {}) as { rating?: number; reviews?: number };
  return (
    <Link href={`/shop/${product.slug}`} className="group flex flex-col overflow-hidden rounded-xl border bg-card transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl">
      <div className="relative aspect-square overflow-hidden bg-muted">
        <Image src={product.image} alt={product.name} fill sizes="(max-width:768px) 50vw, 25vw" className="object-cover transition duration-500 group-hover:scale-105" />
        {product.stock === 0 ? (
          <span className="absolute left-3 top-3 rounded-full bg-destructive px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-destructive-foreground">Sold out</span>
        ) : product.stock < 10 ? (
          <span className="absolute left-3 top-3 rounded-full bg-warning px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">Low stock</span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">{product.brand}</p>
        <h3 className="line-clamp-2 font-sans text-sm font-semibold leading-snug tracking-normal">{product.name}</h3>
        <div className="mt-auto flex items-center justify-between pt-3">
          <span className="font-mono text-base font-semibold">{formatCurrency(product.price)}</span>
          {attrs.rating && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground"><Star className="h-3.5 w-3.5 fill-primary text-primary" />{attrs.rating} <span className="hidden sm:inline">({attrs.reviews})</span></span>
          )}
        </div>
      </div>
    </Link>
  );
}
