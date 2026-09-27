import Image from "next/image";
import Link from "next/link";
import { PageHeader } from "@/components/marketing/page-header";
import { listEquipment } from "@/server/services/gym";
import { MUSCLE_GROUPS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export const metadata = { title: "Equipment guide" };

export default async function EquipmentGuidePage({ searchParams }: { searchParams: { muscle?: string } }) {
  const equipment = await listEquipment({ muscle: searchParams.muscle });
  return (
    <>
      <PageHeader eyebrow="Equipment library" title="Train every machine with confidence." description="Step-by-step guides and safety tips for every piece of kit. Scan the QR code on any machine in our clubs to open its guide." image="/images/equipment/cable-crossover.jpg" />
      <section className="container-x py-12">
        <div className="mb-8 flex flex-wrap gap-2">
          {["All", ...MUSCLE_GROUPS].map((m) => {
            const active = m === "All" ? !searchParams.muscle : searchParams.muscle === m;
            return <Link key={m} href={m === "All" ? "/equipment-guide" : `/equipment-guide?muscle=${encodeURIComponent(m)}`} className={cn("rounded-full border px-4 py-1.5 text-sm", active ? "border-primary bg-primary text-primary-foreground" : "hover:border-primary/50")}>{m}</Link>;
          })}
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {equipment.map((e) => (
            <Link key={e.id} href={`/equipment-guide/${e.id}`} className="group overflow-hidden rounded-2xl border bg-card transition hover:border-primary/40">
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image src={e.image} alt={e.name} fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover transition duration-500 group-hover:scale-105" />
                <span className="absolute left-3 top-3 rounded-full bg-black/70 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white">{e.difficulty}</span>
              </div>
              <div className="p-5">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">{e.category} · {e.manufacturer}</p>
                <h3 className="mt-1 text-lg font-bold">{e.name}</h3>
                <div className="mt-3 flex flex-wrap gap-1.5">{e.muscles.map((m) => <span key={m} className="rounded-md bg-muted px-2 py-0.5 text-xs">{m}</span>)}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
