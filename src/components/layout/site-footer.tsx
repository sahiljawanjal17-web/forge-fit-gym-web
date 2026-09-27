import Link from "next/link";
import { CLUBS } from "@/server/db/seed/data";

const cols = [
  { title: "Train", links: [["Membership plans", "/pricing"], ["Equipment guide", "/equipment-guide"], ["Our clubs", "/about"], ["Member login", "/login"]] },
  { title: "Store", links: [["Protein", "/shop?category=Protein"], ["Performance", "/shop?category=Performance"], ["Apparel", "/shop?category=Apparel"], ["Accessories", "/shop?category=Accessories"]] },
  { title: "Company", links: [["About Forge Fit", "/about"], ["Contact", "/contact"], ["Owner dashboard", "/admin/overview"]] },
];

export function SiteFooter() {
  return (
    <footer className="border-t bg-card">
      <div className="container-x grid gap-10 py-16 md:grid-cols-5">
        <div className="md:col-span-2">
          <Link href="/" className="font-heading text-2xl font-extrabold">FORGE<span className="text-primary">FIT</span></Link>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
            Architectural training spaces, world-class coaching and performance nutrition — in {CLUBS.length} cities and online.
          </p>
          <p className="mt-4 text-xs text-muted-foreground">{CLUBS.map((c) => c.city).join(" · ")}</p>
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <h4 className="mb-4 font-sans text-sm font-semibold">{c.title}</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              {c.links.map(([label, href]) => (
                <li key={href + label}><Link href={href} className="hover:text-primary">{label}</Link></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t">
        <div className="container-x flex flex-col items-center justify-between gap-2 py-6 text-xs text-muted-foreground md:flex-row">
          <span>© {new Date().getFullYear()} Forge Fit Global. All rights reserved.</span>
          <span>hello@forgefit.com · +44 20 7946 0100</span>
        </div>
      </div>
    </footer>
  );
}
