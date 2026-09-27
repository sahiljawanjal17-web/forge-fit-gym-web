import { redirect } from "next/navigation";
import { CartLines, CartSummary } from "@/components/shop/cart-lines";
import { CheckoutForm } from "@/components/shop/checkout-form";
import { requireUser } from "@/lib/auth";
import { getCart } from "@/server/services/store";

export const metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const user = await requireUser();
  const cart = await getCart(user.id);
  if (cart.items.length === 0) redirect("/cart");
  return (
    <div className="container-x pb-20 pt-28">
      <h1 className="mb-8 text-4xl font-extrabold">Checkout</h1>
      <div className="grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3"><CheckoutForm total={cart.total} name={user.name} /></div>
        <aside className="h-fit space-y-5 lg:col-span-2">
          <CartLines items={cart.items} readOnly />
          <div className="rounded-2xl border bg-card p-6"><CartSummary cart={cart} /></div>
        </aside>
      </div>
    </div>
  );
}
