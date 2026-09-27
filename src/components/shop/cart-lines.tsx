"use client";

import Image from "next/image";
import Link from "next/link";
import { useTransition } from "react";
import { Loader2, Minus, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { setCartQuantityAction } from "@/server/actions";
import { formatCurrency } from "@/lib/utils";

type Line = { id: string; quantity: number; variantName: string | null; productName: string; slug: string; price: number; stock: number; image: string };

export function CartLines({ items, readOnly }: { items: Line[]; readOnly?: boolean }) {
  const [pending, start] = useTransition();
  const update = (id: string, q: number) => start(async () => {
    const res = await setCartQuantityAction(id, q);
    if (!res.ok) toast.error(res.message);
  });

  return (
    <ul className="divide-y rounded-2xl border bg-card">
      {items.map((i) => (
        <li key={i.id} className="flex gap-4 p-4">
          <Link href={`/shop/${i.slug}`} className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
            <Image src={i.image} alt={i.productName} fill sizes="80px" className="object-cover" />
          </Link>
          <div className="flex min-w-0 flex-1 flex-col">
            <Link href={`/shop/${i.slug}`} className="truncate font-medium hover:text-primary">{i.productName}</Link>
            <p className="text-sm text-muted-foreground">{i.variantName}</p>
            <div className="mt-auto flex items-center justify-between pt-2">
              {readOnly ? (
                <span className="text-sm text-muted-foreground">Qty {i.quantity}</span>
              ) : (
                <div className="flex items-center rounded-lg border">
                  <Button variant="ghost" size="icon" className="h-8 w-8" disabled={pending} onClick={() => update(i.id, i.quantity - 1)}><Minus className="h-3.5 w-3.5" /></Button>
                  <span className="w-7 text-center font-mono text-sm">{pending ? <Loader2 className="mx-auto h-3 w-3 animate-spin" /> : i.quantity}</span>
                  <Button variant="ghost" size="icon" className="h-8 w-8" disabled={pending || i.quantity >= i.stock} onClick={() => update(i.id, i.quantity + 1)}><Plus className="h-3.5 w-3.5" /></Button>
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className="font-mono font-semibold">{formatCurrency(i.price * i.quantity)}</span>
                {!readOnly && <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" disabled={pending} onClick={() => update(i.id, 0)} aria-label="Remove"><Trash2 className="h-4 w-4" /></Button>}
              </div>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function CartSummary({ cart }: { cart: { subtotal: number; discountRate: number; discountAmount: number; shipping: number; tax: number; total: number } }) {
  const row = (label: string, value: string, cls = "") => (
    <div className={`flex justify-between ${cls}`}><span className="text-muted-foreground">{label}</span><span className="font-mono">{value}</span></div>
  );
  return (
    <div className="space-y-2.5 text-sm">
      {row("Subtotal", formatCurrency(cart.subtotal))}
      {cart.discountAmount > 0 && row(`Member discount (${cart.discountRate * 100}%)`, `−${formatCurrency(cart.discountAmount)}`, "text-success")}
      {row("Shipping", cart.shipping === 0 ? "Free" : formatCurrency(cart.shipping))}
      {row("Tax (8%)", formatCurrency(cart.tax))}
      <div className="flex justify-between border-t pt-3 text-base font-semibold"><span>Total</span><span className="font-mono">{formatCurrency(cart.total)}</span></div>
    </div>
  );
}
