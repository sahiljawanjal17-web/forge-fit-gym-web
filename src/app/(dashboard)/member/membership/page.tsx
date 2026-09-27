import { Check } from "lucide-react";
import { PageTitle, StatusBadge } from "@/components/dashboard/shell";
import { ActionButton } from "@/components/dashboard/action-button";
import { PricingCards } from "@/components/marketing/pricing-cards";
import { requireUser } from "@/lib/auth";
import { membershipStatusAction } from "@/server/actions";
import { getMembership, listPlans } from "@/server/services/gym";
import { formatCurrency, formatDate } from "@/lib/utils";

export const metadata = { title: "Membership" };

export default async function MembershipPage() {
  const user = await requireUser();
  const [m, plans] = await Promise.all([getMembership(user.id), listPlans()]);
  return (
    <>
      <PageTitle title="Membership" description="Manage, pause or switch your plan any time." />
      {m && (
        <section className="mb-10 grid gap-6 rounded-xl border bg-card p-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3"><h2 className="text-2xl font-bold">{m.plan.name}</h2><StatusBadge status={m.status} /></div>
            <p className="mt-1 text-sm text-muted-foreground">{formatCurrency(m.plan.price)} / {m.plan.billingCycle === "annual" ? "year" : "month"} · Started {formatDate(m.startDate, "d MMM yyyy")} · {m.autoRenew ? "Renews" : "Ends"} {formatDate(m.endDate!, "d MMM yyyy")}</p>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">{m.plan.features.map((f) => <li key={f} className="flex gap-2 text-sm"><Check className="h-4 w-4 text-primary" />{f}</li>)}</ul>
          </div>
          <div className="flex flex-col gap-2 md:items-end md:justify-center">
            {m.status === "active" && <ActionButton variant="outline" action={membershipStatusAction.bind(null, "pause")} confirm="Pause your membership? Billing stops until you resume.">Pause membership</ActionButton>}
            {m.status === "paused" && <ActionButton action={membershipStatusAction.bind(null, "resume")}>Resume membership</ActionButton>}
            <ActionButton variant="ghost" className="text-destructive" action={membershipStatusAction.bind(null, "cancel")} confirm="Cancel your membership? You'll lose access at the end of the period.">Cancel membership</ActionButton>
          </div>
        </section>
      )}
      <h2 className="mb-6 text-xl font-bold">{m ? "Switch plan" : "Choose a plan"}</h2>
      <PricingCards plans={plans} loggedIn currentPlanId={m?.planId} />
    </>
  );
}
