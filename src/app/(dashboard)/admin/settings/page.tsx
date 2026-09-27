import { CheckCircle2, CircleDashed } from "lucide-react";
import { PageTitle } from "@/components/dashboard/shell";
import { requireStaff } from "@/lib/auth";
import { DATA_DIR } from "@/server/db";
import { listClubs } from "@/server/services/gym";

export const metadata = { title: "Settings" };

const integrations = [
  { name: "Forge AI (OpenRouter free models)", env: "OPENROUTER_API_KEY", note: () => `Primary: ${process.env.AI_MODEL_PRIMARY ?? "default"}` },
  { name: "Stripe payments", env: "STRIPE_SECRET_KEY", note: () => "Cards, subscriptions, Klarna/Afterpay" },
  { name: "Razorpay payments", env: "RAZORPAY_KEY_ID", note: () => "UPI, net banking, card & cardless EMI" },
  { name: "Resend email", env: "RESEND_API_KEY", note: () => "Order & renewal emails" },
];

export default async function SettingsPage() {
  const user = await requireStaff();
  const clubs = await listClubs();
  return (
    <>
      <PageTitle title="Settings" description="Brand, clubs, data storage and integrations." />
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border bg-card p-6">
          <h2 className="mb-4 text-lg font-bold">Integrations</h2>
          <ul className="space-y-3">
            {integrations.map((i) => {
              const on = !!process.env[i.env];
              return (
                <li key={i.env} className="flex items-start gap-3 rounded-lg border p-3 text-sm">
                  {on ? <CheckCircle2 className="h-5 w-5 text-success" /> : <CircleDashed className="h-5 w-5 text-muted-foreground" />}
                  <div><p className="font-medium">{i.name}</p><p className="text-xs text-muted-foreground">{on ? i.note() : `Not connected — set ${i.env} in .env.local (demo mode active)`}</p></div>
                </li>
              );
            })}
          </ul>
        </section>
        <section className="space-y-6">
          <div className="rounded-xl border bg-card p-6 text-sm">
            <h2 className="mb-4 text-lg font-bold">Data storage</h2>
            <p className="text-muted-foreground">All website data (members, orders, stock, chats) is stored in an embedded PostgreSQL database in:</p>
            <code className="mt-2 block break-all rounded-md bg-muted p-3 font-mono text-xs">{DATA_DIR}</code>
            <p className="mt-2 text-xs text-muted-foreground">Back up this folder to back up the entire site. Delete it to reset to fresh demo data.</p>
          </div>
          <div className="rounded-xl border bg-card p-6 text-sm">
            <h2 className="mb-4 text-lg font-bold">Account & clubs</h2>
            <p>{user.name} · <span className="text-muted-foreground">{user.email} · {user.role}</span></p>
            <ul className="mt-3 space-y-1 text-muted-foreground">{clubs.map((c) => <li key={c.id}>{c.name}</li>)}</ul>
          </div>
        </section>
      </div>
    </>
  );
}
