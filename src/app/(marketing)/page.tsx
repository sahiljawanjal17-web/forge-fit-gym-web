import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Bot, Dumbbell, MessageCircle, QrCode, ShoppingBag, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NumberTicker } from "@/components/magicui/number-ticker";
import { Marquee } from "@/components/magicui/marquee";
import { BlurFade } from "@/components/magicui/blur-fade";
import { PricingCards } from "@/components/marketing/pricing-cards";
import { ProductCard } from "@/components/shop/product-card";
import { getSession } from "@/lib/auth";
import { listPlans, getMembership } from "@/server/services/gym";
import { listProducts } from "@/server/services/store";
import { CLUBS, TRAINERS } from "@/server/db/seed/data";

const stats = [
  { value: 5, suffix: "", label: "Global clubs" },
  { value: 12400, suffix: "+", label: "Active members" },
  { value: 60, suffix: "+", label: "Elite coaches" },
  { value: 98, suffix: "%", label: "Member satisfaction" },
];

const features = [
  { icon: Dumbbell, title: "Premium equipment", body: "Rogue, Eleiko & Technogym floors designed for serious training.", media: "/videos/hero-2.mp4", span: "md:col-span-2 md:row-span-2" },
  { icon: ShoppingBag, title: "Performance store", body: "Lab-tested nutrition and gear, member-priced.", image: "/images/products/whey.jpg", href: "/shop" },
  { icon: Bot, title: "Forge AI assistant", body: "Shop, track orders and manage your plan by chat.", image: "/images/site/fitness3.jpg" },
  { icon: QrCode, title: "Equipment guides + QR", body: "Scan any machine for step-by-step form coaching.", image: "/images/equipment/cable-crossover.jpg", href: "/equipment-guide" },
  { icon: MessageCircle, title: "Direct line to your club", body: "Message the owner and coaches in-app.", image: "/images/equipment/battle-ropes.jpg" },
];

const testimonials = [
  { name: "Priya S.", club: "Mumbai", text: "The coaching here is on another level. Down 9 kg and deadlifting 120 kg in six months." },
  { name: "James W.", club: "London", text: "Feels like a design hotel that happens to have the best strength floor in the city." },
  { name: "Layla H.", club: "Dubai", text: "Forge AI reordered my protein and booked a coach while I was on the treadmill." },
  { name: "Marco R.", club: "New York", text: "VIP travel access is unreal — same standard in every city I visit." },
  { name: "Wei L.", club: "Singapore", text: "Equipment QR guides fixed my squat form faster than a year of YouTube." },
  { name: "Hannah K.", club: "London", text: "Recovery zone, sauna and pool after a heavy session. Worth every penny." },
];

export default async function HomePage() {
  const session = await getSession();
  const [plans, products, membership] = await Promise.all([
    listPlans(),
    listProducts({ limit: 8 }),
    session ? getMembership(session.user.id) : null,
  ]);

  return (
    <>
      <section className="relative flex min-h-[100svh] items-center overflow-hidden bg-black text-white">
        <video className="absolute inset-0 h-full w-full object-cover opacity-70" src="/videos/hero-1.mp4" poster="/images/site/fitness2.jpg" autoPlay muted loop playsInline />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/10" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" />
        <div className="container-x relative z-10 pt-24">
          <BlurFade delay={0.1}><p className="eyebrow">Premium fitness · 5 cities · 1 standard</p></BlurFade>
          <BlurFade delay={0.25}>
            <h1 className="mt-5 max-w-4xl text-5xl font-extrabold leading-[0.95] sm:text-7xl lg:text-8xl">
              Forge your strength.<br /><span className="text-primary">Elevate your life.</span>
            </h1>
          </BlurFade>
          <BlurFade delay={0.4}>
            <p className="mt-6 max-w-xl text-lg text-white/75">Architectural training clubs, world-class coaches and performance nutrition — with an AI assistant that runs your fitness life for you.</p>
          </BlurFade>
          <BlurFade delay={0.55}>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button asChild size="lg" className="h-12 rounded-full px-8 text-base"><Link href={session ? "/member/dashboard" : "/register"}>Start your journey <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
              <Button asChild size="lg" variant="outline" className="h-12 rounded-full border-white/30 bg-white/5 px-8 text-base text-white backdrop-blur hover:bg-white/15 hover:text-white"><Link href="/pricing">Explore plans</Link></Button>
            </div>
          </BlurFade>
        </div>
      </section>

      <section className="relative z-10 -mt-16">
        <div className="container-x">
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border bg-border lg:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="bg-card p-6 text-center lg:p-8">
                <div className="font-heading text-3xl font-extrabold lg:text-5xl"><NumberTicker value={s.value} className="text-foreground dark:text-foreground" />{s.suffix}</div>
                <p className="mt-2 text-xs uppercase tracking-widest text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-x py-24">
        <div className="mb-12 max-w-2xl">
          <p className="eyebrow">Why Forge Fit</p>
          <h2 className="mt-3 text-4xl font-bold sm:text-5xl">Everything a serious athlete needs, under one roof.</h2>
        </div>
        <div className="grid auto-rows-[240px] gap-4 md:grid-cols-3">
          {features.map((f) => {
            const card = (
              <div className={`group relative h-full overflow-hidden rounded-2xl border bg-black text-white`}>
                {f.media ? (
                  <video className="absolute inset-0 h-full w-full object-cover opacity-60 transition duration-700 group-hover:scale-105" src={f.media} autoPlay muted loop playsInline />
                ) : (
                  <Image src={f.image!} alt="" fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover opacity-50 transition duration-700 group-hover:scale-105 group-hover:opacity-40" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <f.icon className="mb-3 h-7 w-7 text-primary" />
                  <h3 className="text-xl font-bold">{f.title}</h3>
                  <p className="mt-1 max-w-sm text-sm text-white/70">{f.body}</p>
                </div>
              </div>
            );
            return f.href ? <Link key={f.title} href={f.href} className={f.span}>{card}</Link> : <div key={f.title} className={f.span}>{card}</div>;
          })}
        </div>
      </section>

      <section className="border-y bg-card py-5">
        <Marquee pauseOnHover className="[--duration:30s]">
          {CLUBS.map((c) => (
            <span key={c.name} className="mx-8 font-heading text-2xl font-bold uppercase tracking-tight text-muted-foreground">{c.city} <span className="text-primary">✦</span></span>
          ))}
        </Marquee>
      </section>

      <section id="plans" className="container-x py-24">
        <div className="mx-auto mb-4 max-w-2xl text-center">
          <p className="eyebrow">Membership</p>
          <h2 className="mt-3 text-4xl font-bold sm:text-5xl">Pick your level of commitment.</h2>
          <p className="mt-4 text-muted-foreground">No joining fee. Cancel or pause anytime. Premium & VIP save on every store order.</p>
        </div>
        <PricingCards plans={plans} loggedIn={!!session} currentPlanId={membership?.planId} />
      </section>

      <section className="bg-card py-24">
        <div className="container-x">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Performance store</p>
              <h2 className="mt-3 text-4xl font-bold sm:text-5xl">Fuel the work.</h2>
            </div>
            <Button asChild variant="outline" className="rounded-full"><Link href="/shop">Shop all <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
          </div>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {products.map((p) => <ProductCard key={p.slug} product={p} />)}
          </div>
        </div>
      </section>

      <section className="container-x py-24">
        <div className="mb-12 max-w-2xl">
          <p className="eyebrow">Coaching team</p>
          <h2 className="mt-3 text-4xl font-bold sm:text-5xl">Coached by the best in the world.</h2>
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {TRAINERS.map((t) => (
            <div key={t.name} className="group overflow-hidden rounded-2xl border bg-card">
              <div className="relative aspect-[4/5] overflow-hidden">
                <Image src={t.image} alt={t.name} fill sizes="(max-width:768px) 50vw, 25vw" className="object-cover grayscale transition duration-500 group-hover:scale-105 group-hover:grayscale-0" />
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold">{t.name}</h3>
                <p className="text-sm font-medium text-primary">{t.role}</p>
                <p className="mt-2 text-sm text-muted-foreground">{t.bio}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="overflow-hidden py-16">
        <div className="container-x mb-8"><p className="eyebrow">Member stories</p></div>
        <Marquee pauseOnHover className="[--duration:45s]">
          {testimonials.map((t) => (
            <figure key={t.name} className="w-80 rounded-2xl border bg-card p-6">
              <div className="flex gap-0.5">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-primary text-primary" />)}</div>
              <blockquote className="mt-3 text-sm leading-relaxed">“{t.text}”</blockquote>
              <figcaption className="mt-4 text-xs font-semibold text-muted-foreground">{t.name} · {t.club}</figcaption>
            </figure>
          ))}
        </Marquee>
      </section>

      <section className="container-x pb-24">
        <div className="relative overflow-hidden rounded-3xl bg-black px-8 py-20 text-center text-white">
          <video className="absolute inset-0 h-full w-full object-cover opacity-40" src="/videos/hero-3.mp4" autoPlay muted loop playsInline />
          <div className="relative">
            <h2 className="text-4xl font-extrabold sm:text-6xl">Your first week is on us.</h2>
            <p className="mx-auto mt-4 max-w-lg text-white/75">Create an account, pick a club and train free for 7 days. No card required.</p>
            <Button asChild size="lg" className="mt-8 h-12 rounded-full px-10 text-base"><Link href="/register">Claim free week</Link></Button>
          </div>
        </div>
      </section>
    </>
  );
}
