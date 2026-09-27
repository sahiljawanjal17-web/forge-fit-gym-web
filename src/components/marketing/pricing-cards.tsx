"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { subscribeAction } from "@/server/actions";
import { cn, formatCurrency } from "@/lib/utils";

type Plan = { id: string; name: string; tier: string; billingCycle: string; price: number; description: string | null; features: string[] };

export function PricingCards({ plans, loggedIn, currentPlanId }: { plans: Plan[]; loggedIn: boolean; currentPlanId?: string }) {
  const [cycle, setCycle] = useState<"monthly" | "annual">("monthly");
  const [selected, setSelected] = useState<Plan | null>(null);
  const [method, setMethod] = useState<"card" | "upi" | "pay_at_club">("card");
  const [pending, start] = useTransition();
  const router = useRouter();
  const visible = plans.filter((p) => p.billingCycle === cycle);

  const confirm = () => start(async () => {
    const res = await subscribeAction(selected!.id, method);
    if (!res.ok) return void toast.error(res.message);
    toast.success(`You're on ${selected!.name}!`);
    setSelected(null);
    router.push("/member/membership");
  });

  return (
    <div>
      <div className="mb-10 flex justify-center">
        <div className="inline-flex rounded-full border bg-card p-1 text-sm">
          {(["monthly", "annual"] as const).map((c) => (
            <button key={c} onClick={() => setCycle(c)} className={cn("rounded-full px-5 py-2 font-medium capitalize transition", cycle === c ? "bg-primary text-primary-foreground" : "text-muted-foreground")}>
              {c}{c === "annual" && <span className="ml-1.5 text-xs opacity-80">2 months free</span>}
            </button>
          ))}
        </div>
      </div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {visible.map((p) => {
          const featured = p.tier === "premium";
          const current = p.id === currentPlanId;
          return (
            <div key={p.id} className={cn("relative flex flex-col rounded-2xl border bg-card p-7", featured && "border-primary shadow-2xl shadow-primary/10 xl:-translate-y-3")}>
              {featured && <span className="absolute -top-3 left-7 rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary-foreground">Most popular</span>}
              <h3 className="text-2xl font-bold">{p.name.replace(/ (Monthly|Annual)$/, "")}</h3>
              <p className="mt-2 min-h-[40px] text-sm text-muted-foreground">{p.description}</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="font-heading text-4xl font-extrabold">{formatCurrency(p.price)}</span>
                <span className="text-sm text-muted-foreground">/{cycle === "monthly" ? "mo" : "yr"}</span>
              </div>
              <ul className="my-7 flex-1 space-y-3 text-sm">
                {p.features.map((f) => (
                  <li key={f} className="flex gap-2.5"><Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{f}</li>
                ))}
              </ul>
              {current ? (
                <Button disabled variant="outline">Current plan</Button>
              ) : loggedIn ? (
                <Button variant={featured ? "default" : "outline"} onClick={() => setSelected(p)}>Choose {p.name.split(" ")[0]}</Button>
              ) : (
                <Button asChild variant={featured ? "default" : "outline"}><Link href={`/register?plan=${p.tier}`}>Get started</Link></Button>
              )}
            </div>
          );
        })}
      </div>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm {selected?.name}</DialogTitle>
            <DialogDescription>{selected && `${formatCurrency(selected.price)} billed ${selected.billingCycle}. Any current plan is replaced immediately.`}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-2">
            {([["card", "Credit / debit card (Stripe)"], ["upi", "UPI / EMI (Razorpay)"], ["pay_at_club", "Pay at the club front desk"]] as const).map(([v, label]) => (
              <label key={v} className={cn("flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm", method === v && "border-primary bg-primary/5")}>
                <input type="radio" name="method" checked={method === v} onChange={() => setMethod(v)} className="accent-[hsl(var(--primary))]" />{label}
              </label>
            ))}
            <p className="text-xs text-muted-foreground">Demo mode: online payments are simulated until gateway keys are added.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelected(null)}>Back</Button>
            <Button onClick={confirm} disabled={pending}>{pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Confirm & pay</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
