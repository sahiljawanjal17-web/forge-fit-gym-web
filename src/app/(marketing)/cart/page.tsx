import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CartLines, CartSummary } from "@/components/shop/cart-lines";
import { requireUser } from "@/lib/auth";
import { getCart } from "@/server/services/store";

export const metadata = { title: "Your cart" };

export default async function CartPage() {
  const user = await requireUser();
  const cart = await getCart(user.id);
  return (
    <div className="container-x pb-20 pt-28">
      <h1 className="mb-8 text-4xl font-extrabold">Your cart</h1>
      {cart.items.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border bg-card py-20 text-center">
          <ShoppingBag className="h-10 w-10 text-muted-foreground" />
          <p className="text-muted-foreground">Your cart is empty.</p>
          <Button asChild><Link href="/shop">Browse the store</Link></Button>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2"><CartLines items={cart.items} /></div>
          <aside className="h-fit space-y-5 rounded-2xl border bg-card p-6">
            <h2 className="text-lg font-bold">Order summary</h2>
            <CartSummary cart={cart} />
            {cart.discountRate === 0 && <p className="text-xs text-muted-foreground"><Link href="/pricing" className="text-primary underline">Premium members</Link> save 10% on every order.</p>}
            <Button asChild size="lg" className="w-full"><Link href="/checkout">Checkout</Link></Button>
          </aside>
        </div>
      )}
    </div>
  );
}
