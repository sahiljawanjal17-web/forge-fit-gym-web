import Image from "next/image";

export function PageHeader({ eyebrow, title, description, image }: { eyebrow: string; title: string; description?: string; image?: string }) {
  return (
    <section className="relative overflow-hidden bg-black pb-16 pt-36 text-white">
      {image && <Image src={image} alt="" fill priority sizes="100vw" className="object-cover opacity-35" />}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-black/40 to-black/60" />
      <div className="container-x relative">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-extrabold sm:text-6xl">{title}</h1>
        {description && <p className="mt-4 max-w-2xl text-lg text-white/70">{description}</p>}
      </div>
    </section>
  );
}
