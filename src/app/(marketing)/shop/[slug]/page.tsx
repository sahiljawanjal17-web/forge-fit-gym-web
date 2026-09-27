import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, RotateCcw, ShieldCheck, Star, Truck } from "lucide-react";
import { AddToCart } from "@/components/shop/add-to-cart";
import { ProductCard } from "@/components/shop/product-card";
import { getSession } from "@/lib/auth";
import { getMemberDiscount, getProduct, listProducts } from "@/server/services/store";

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProduct(params.slug);
  if (!product) notFound();
  const session = await getSession();
  const [discount, related] = await Promise.all([
    session ? getMemberDiscount(session.user.id) : { rate: 0 },
    listProducts({ category: product.category?.name, limit: 5 }),
  ]);
  const attrs = (product.attributes ?? {}) as { rating?: number; reviews?: number };

  return (
    <div className="container-x pb-20 pt-28">
      <Link href="/shop" className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-primary"><ChevronLeft className="mr-1 h-4 w-4" />Back to store</Link>
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-2xl border bg-muted">
          <Image src={product.images[0]?.url ?? "/images/products/whey.jpg"} alt={product.name} fill priority sizes="(max-width:1024px) 100vw, 50vw" className="object-cover" />
        </div>
        <div>
          <p className="eyebrow">{product.brand} · {product.category?.name}</p>
          <h1 className="mt-3 text-4xl font-extrabold">{product.name}</h1>
          {attrs.rating && (
            <p className="mt-3 flex items-center gap-1.5 text-sm text-muted-foreground"><Star className="h-4 w-4 fill-primary text-primary" />{attrs.rating} · {attrs.reviews} reviews</p>
          )}
          <p className="my-6 leading-relaxed text-muted-foreground">{product.description}</p>
          <AddToCart variants={product.variants} loggedIn={!!session} discountRate={discount.rate} />
          <div className="mt-8 grid gap-3 border-t pt-6 text-sm sm:grid-cols-3">
            <p className="flex items-center gap-2"><Truck className="h-4 w-4 text-primary" />Free shipping over $100</p>
            <p className="flex items-center gap-2"><RotateCcw className="h-4 w-4 text-primary" />30-day returns</p>
            <p className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" />Batch lab-tested</p>
          </div>
        </div>
      </div>
      {related.filter((r) => r.slug !== product.slug).length > 0 && (
        <section className="mt-20">
          <h2 className="mb-6 text-2xl font-bold">You may also like</h2>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {related.filter((r) => r.slug !== product.slug).slice(0, 4).map((p) => <ProductCard key={p.slug} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}
