"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Loader2, Minus, Plus, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { addToCartAction } from "@/server/actions";
import { cn, formatCurrency } from "@/lib/utils";

type Variant = { id: string; name: string | null; price: number; stock: number };

export function AddToCart({ variants, loggedIn, discountRate }: { variants: Variant[]; loggedIn: boolean; discountRate: number }) {
  const [variantId, setVariantId] = useState(variants.find((v) => v.stock > 0)?.id ?? variants[0]?.id);
  const [qty, setQty] = useState(1);
  const [pending, start] = useTransition();
  const router = useRouter();
  const variant = variants.find((v) => v.id === variantId)!;

  const add = () => start(async () => {
    const res = await addToCartAction(variantId, qty);
    if (!res.ok) return void toast.error(res.message);
    toast.success(`${qty} × ${variant.name} added`, { action: { label: "View cart", onClick: () => router.push("/cart") } });
  });

  return (
    <div className="space-y-6">
      <div className="flex items-baseline gap-3">
        <span className="font-heading text-4xl font-extrabold">{formatCurrency(variant.price)}</span>
        {discountRate > 0 && <span className="text-sm font-medium text-success">{formatCurrency(variant.price * (1 - discountRate))} with your membership</span>}
      </div>
      <div>
        <p className="mb-2 text-sm font-medium">Option</p>
        <div className="flex flex-wrap gap-2">
          {variants.map((v) => (
            <button key={v.id} disabled={v.stock === 0} onClick={() => { setVariantId(v.id); setQty(1); }}
              className={cn("rounded-lg border px-4 py-2 text-sm transition disabled:cursor-not-allowed disabled:opacity-40", v.id === variantId ? "border-primary bg-primary/10 font-medium" : "hover:border-primary/50")}>
              {v.name}
            </button>
          ))}
        </div>
        <p className={cn("mt-3 text-sm", variant.stock === 0 ? "text-destructive" : variant.stock < 10 ? "text-warning" : "text-muted-foreground")}>
          {variant.stock === 0 ? "Out of stock" : variant.stock < 10 ? `Only ${variant.stock} left` : "In stock · ships in 24h"}
        </p>
      </div>
      <div className="flex gap-3">
        <div className="flex items-center rounded-lg border">
          <Button variant="ghost" size="icon" onClick={() => setQty(Math.max(1, qty - 1))}><Minus className="h-4 w-4" /></Button>
          <span className="w-8 text-center font-mono">{qty}</span>
          <Button variant="ghost" size="icon" onClick={() => setQty(Math.min(variant.stock, qty + 1))}><Plus className="h-4 w-4" /></Button>
        </div>
        {loggedIn ? (
          <Button size="lg" className="flex-1" disabled={pending || variant.stock === 0} onClick={add}>
            {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShoppingBag className="mr-2 h-4 w-4" />}Add to cart
          </Button>
        ) : (
          <Button size="lg" asChild className="flex-1"><Link href="/login?next=/shop">Sign in to buy</Link></Button>
        )}
      </div>
    </div>
  );
}
