import Image from "next/image";
import { MapPin, Users } from "lucide-react";
import { PageHeader } from "@/components/marketing/page-header";
import { listClubs } from "@/server/services/gym";

export const metadata = { title: "Our clubs" };

const clubImages = ["/images/site/fitness1.jpg", "/images/site/fitness2.jpg", "/images/site/fitness3.jpg", "/images/site/fitness4.jpg", "/images/equipment/barbell.jpg"];

const values = [
  ["Architecture first", "Cast concrete, gunmetal and natural light — spaces designed to make you want to train."],
  ["Coaching over machines", "Every member gets real coaching time, not just a key card."],
  ["Science-led nutrition", "Every product in our store is batch lab-tested by third parties."],
  ["One global standard", "Train in London on Monday and Dubai on Friday with the same experience."],
];

export default async function AboutPage() {
  const clubs = await listClubs();
  return (
    <>
      <PageHeader eyebrow="About Forge Fit" title="Built for people who show up." description="Founded in London in 2016, Forge Fit now runs five flagship clubs across four continents — home to 12,000+ members." image="/images/site/fitness3.jpg" />
      <section className="container-x grid gap-6 py-20 md:grid-cols-2 lg:grid-cols-4">
        {values.map(([t, b], i) => (
          <div key={t} className="rounded-2xl border bg-card p-6">
            <span className="font-mono text-sm text-primary">0{i + 1}</span>
            <h3 className="mt-3 text-xl font-bold">{t}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{b}</p>
          </div>
        ))}
      </section>
      <section className="container-x pb-24">
        <p className="eyebrow">Locations</p>
        <h2 className="mb-10 mt-3 text-4xl font-bold">Our flagship clubs</h2>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {clubs.map((c, i) => (
            <article key={c.id} className="group overflow-hidden rounded-2xl border bg-card">
              <div className="relative aspect-[16/10] overflow-hidden">
                <Image src={clubImages[i % clubImages.length]} alt={c.name} fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover transition duration-500 group-hover:scale-105" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold">{c.name.split("—")[1]?.trim() ?? c.name}</h3>
                <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground"><MapPin className="h-4 w-4 text-primary" />{c.city}</p>
                <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground"><Users className="h-4 w-4 text-primary" />Capacity {c.capacity} · Open 5am – 11pm</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
