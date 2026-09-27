import { Search } from "lucide-react";
import { PageTitle, StatusBadge } from "@/components/dashboard/shell";
import { Input } from "@/components/ui/input";
import { requireStaff } from "@/lib/auth";
import { listMembers } from "@/server/services/analytics";
import { formatCurrency, formatDate, formatRelativeTime } from "@/lib/utils";

export const metadata = { title: "Members" };

export default async function MembersPage({ searchParams }: { searchParams: { q?: string } }) {
  await requireStaff();
  const members = await listMembers({ q: searchParams.q });
  return (
    <>
      <PageTitle title="Members" description={`${members.length} members · churn risk scored from visits, recency and renewal status`}
        action={<form className="relative w-72"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input name="q" defaultValue={searchParams.q} placeholder="Search name or email" className="pl-9" /></form>} />
      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full min-w-[900px] text-sm">
          <thead><tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground"><th className="p-4">Member</th><th>Plan</th><th>Status</th><th>Visits 30d</th><th>Last visit</th><th>Lifetime spend</th><th>Joined</th><th className="p-4">Churn risk</th></tr></thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.id} className="border-b last:border-0">
                <td className="p-4"><p className="font-medium">{m.name}</p><p className="text-xs text-muted-foreground">{m.email}</p></td>
                <td>{m.plan ?? "—"}</td>
                <td>{m.membershipStatus ? <StatusBadge status={m.membershipStatus} /> : "—"}</td>
                <td className="font-mono">{m.visits30}</td>
                <td className="text-muted-foreground">{m.lastVisit ? formatRelativeTime(m.lastVisit) : "Never"}</td>
                <td className="font-mono">{formatCurrency(Math.round(m.spend))}</td>
                <td className="text-muted-foreground">{formatDate(m.joined, "MMM yyyy")}</td>
                <td className="p-4" title={m.churn.reasons.join(", ")}><span className="mr-2 font-mono text-xs">{Math.round(m.churn.score * 100)}%</span><StatusBadge status={m.churn.level} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
