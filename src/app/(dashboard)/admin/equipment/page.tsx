import Image from "next/image";
import Link from "next/link";
import { PageTitle, StatusBadge } from "@/components/dashboard/shell";
import { requireStaff } from "@/lib/auth";
import { listEquipment } from "@/server/services/gym";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Equipment" };

export default async function AdminEquipmentPage() {
  await requireStaff();
  const items = await listEquipment();
  return (
    <>
      <PageTitle title="Equipment" description={`${items.length} machines & zones · ${items.filter((i) => i.condition !== "excellent" && i.condition !== "good").length} need attention`} />
      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full min-w-[760px] text-sm">
          <thead><tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground"><th className="p-4">Equipment</th><th>Category</th><th>Club</th><th>Condition</th><th>Last service</th><th className="p-4">Guide</th></tr></thead>
          <tbody>
            {items.map((e) => (
              <tr key={e.id} className="border-b last:border-0">
                <td className="flex items-center gap-3 p-4">
                  <span className="relative h-10 w-10 overflow-hidden rounded-md"><Image src={e.image} alt="" fill sizes="40px" className="object-cover" /></span>
                  <span><p className="font-medium">{e.name}</p><p className="text-xs text-muted-foreground">{e.manufacturer}</p></span>
                </td>
                <td>{e.category}</td><td className="text-xs text-muted-foreground">{e.club}</td>
                <td><StatusBadge status={e.condition} /></td>
                <td className="text-muted-foreground">{e.lastMaintenanceDate ? formatDate(e.lastMaintenanceDate, "d MMM yyyy") : "—"}</td>
                <td className="p-4"><Link href={`/equipment-guide/${e.id}`} className="text-primary">View · QR</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
