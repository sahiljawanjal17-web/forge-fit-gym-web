import { Check, Minus } from "lucide-react";
import { PageHeader } from "@/components/marketing/page-header";
import { PricingCards } from "@/components/marketing/pricing-cards";
import { getSession } from "@/lib/auth";
import { getMembership, listPlans } from "@/server/services/gym";

export const metadata = { title: "Membership plans" };

const matrix: [string, boolean[]][] = [
  ["Gym floor & cardio zone", [true, true, true, true]],
  ["Group classes", [false, true, true, true]],
  ["Sauna & steam", [false, true, true, true]],
  ["Pool, lounge & recovery zone", [false, false, true, true]],
  ["Unlimited coaching", [false, false, true, true]],
  ["Store discount", [false, false, true, true]],
  ["Dedicated personal trainer", [false, false, false, true]],
  ["Access to all global clubs", [false, false, false, true]],
];

const faqs = [
  ["Can I pause my membership?", "Yes — pause any time from your dashboard or just ask Forge AI. Billing stops while paused."],
  ["Is there a joining fee?", "No joining or setup fees on any plan."],
  ["Do you offer EMI?", "Annual plans can be paid in no-cost EMI through Razorpay, or with Klarna/Afterpay internationally."],
  ["Can I switch plans?", "Upgrade or downgrade instantly; the new plan starts today."],
];

export default async function PricingPage() {
  const session = await getSession();
  const [plans, membership] = await Promise.all([listPlans(), session ? getMembership(session.user.id) : null]);
  return (
    <>
      <PageHeader eyebrow="Membership" title="Train without limits." description="Four tiers, one standard of excellence. Pause, switch or cancel whenever life changes." image="/images/site/fitness1.jpg" />
      <section className="container-x py-16"><PricingCards plans={plans} loggedIn={!!session} currentPlanId={membership?.planId} /></section>
      <section className="container-x pb-16">
        <h2 className="mb-6 text-3xl font-bold">Compare plans</h2>
        <div className="overflow-x-auto rounded-2xl border bg-card">
          <table className="w-full min-w-[640px] text-sm">
            <thead><tr className="border-b">{["", "Basic", "Standard", "Premium", "VIP"].map((h) => <th key={h} className="p-4 text-left font-semibold">{h}</th>)}</tr></thead>
            <tbody>
              {matrix.map(([label, cols]) => (
                <tr key={label} className="border-b last:border-0">
                  <td className="p-4 text-muted-foreground">{label}</td>
                  {cols.map((c, i) => <td key={i} className="p-4">{c ? <Check className="h-4 w-4 text-primary" /> : <Minus className="h-4 w-4 text-muted-foreground/40" />}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="container-x pb-24">
        <h2 className="mb-6 text-3xl font-bold">Questions</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {faqs.map(([q, a]) => (
            <div key={q} className="rounded-2xl border bg-card p-6"><h3 className="font-sans text-base font-semibold tracking-normal">{q}</h3><p className="mt-2 text-sm text-muted-foreground">{a}</p></div>
          ))}
        </div>
      </section>
    </>
  );
}
