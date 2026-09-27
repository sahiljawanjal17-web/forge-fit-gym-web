import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, ChevronLeft, QrCode } from "lucide-react";
import { listEquipment } from "@/server/services/gym";

export default async function EquipmentDetailPage({ params }: { params: { id: string } }) {
  const all = await listEquipment();
  const e = all.find((x) => x.id === params.id);
  if (!e) notFound();
  const url = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/equipment-guide/${e.id}`;
  return (
    <div className="container-x pb-24 pt-28">
      <Link href="/equipment-guide" className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-primary"><ChevronLeft className="mr-1 h-4 w-4" />All equipment</Link>
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border">
          <Image src={e.image} alt={e.name} fill priority sizes="(max-width:1024px) 100vw, 50vw" className="object-cover" />
        </div>
        <div>
          <p className="eyebrow">{e.category} · {e.difficulty}</p>
          <h1 className="mt-3 text-4xl font-extrabold">{e.name}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{e.manufacturer} · Targets {e.muscles.join(", ")}</p>
          <h2 className="mb-4 mt-8 text-xl font-bold">How to use</h2>
          <ol className="space-y-3">
            {e.steps.map((s, i) => (
              <li key={i} className="flex gap-4 rounded-xl border bg-card p-4 text-sm">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary font-mono text-xs font-bold text-primary-foreground">{i + 1}</span>{s}
              </li>
            ))}
          </ol>
          {e.safety && (
            <p className="mt-6 flex gap-3 rounded-xl border border-warning/40 bg-warning/10 p-4 text-sm"><AlertTriangle className="h-5 w-5 shrink-0 text-warning" />{e.safety}</p>
          )}
          <div className="mt-6 flex items-center gap-4 rounded-xl border bg-card p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(url)}`} alt="QR code" width={96} height={96} className="rounded bg-white p-1" />
            <p className="flex gap-2 text-sm text-muted-foreground"><QrCode className="h-4 w-4 shrink-0 text-primary" />This QR is printed on the machine at {e.club}. Scan it to open this guide on your phone.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
