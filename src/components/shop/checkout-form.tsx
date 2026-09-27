"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { placeOrderAction } from "@/server/actions";
import { formatCurrency } from "@/lib/utils";

function Submit({ total }: { total: number }) {
  const { pending } = useFormStatus();
  return (
    <Button size="lg" className="w-full" disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Place order · {formatCurrency(total)}
    </Button>
  );
}

export function CheckoutForm({ total, name }: { total: number; name: string }) {
  const [state, action] = useFormState(placeOrderAction, null);
  const field = (id: string, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div className="space-y-1.5"><Label htmlFor={id}>{label}</Label><Input id={id} name={id} required {...props} /></div>
  );
  return (
    <form action={action} className="space-y-8">
      <section className="space-y-4 rounded-2xl border bg-card p-6">
        <h2 className="text-lg font-bold">1. Shipping address</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {field("fullName", "Full name", { defaultValue: name })}
          {field("phone", "Phone", { required: false, type: "tel" })}
          <div className="sm:col-span-2">{field("street", "Street address")}</div>
          {field("city", "City")}
          {field("postalCode", "Postal code")}
          <div className="sm:col-span-2">{field("country", "Country")}</div>
        </div>
      </section>
      <section className="space-y-3 rounded-2xl border bg-card p-6">
        <h2 className="text-lg font-bold">2. Payment</h2>
        {([["card", "Credit / debit card", "Visa, Mastercard, Amex · Klarna & Afterpay (Stripe)"], ["upi", "UPI, net banking & card EMI", "No-cost EMI on 16+ banks (Razorpay)"], ["pay_at_club", "Collect & pay at your club", "Pick up from any Forge Fit front desk"]] as const).map(([v, t, d], i) => (
          <label key={v} className="flex cursor-pointer items-start gap-3 rounded-lg border p-4 has-[:checked]:border-primary has-[:checked]:bg-primary/5">
            <input type="radio" name="paymentMethod" value={v} defaultChecked={i === 0} className="mt-1 accent-[hsl(var(--primary))]" />
            <span><span className="block text-sm font-medium">{t}</span><span className="text-xs text-muted-foreground">{d}</span></span>
          </label>
        ))}
        <p className="text-xs text-muted-foreground">Demo mode: online payments are simulated until Stripe/Razorpay keys are configured.</p>
      </section>
      {state && !state.ok && <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">{state.message}</p>}
      <Submit total={total} />
    </form>
  );
}
