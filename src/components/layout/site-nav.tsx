"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LayoutDashboard, LogOut, Menu, Moon, ShoppingBag, Sun, X } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth/client";
import { cn } from "@/lib/utils";

const links = [
  { href: "/pricing", label: "Membership" },
  { href: "/shop", label: "Store" },
  { href: "/equipment-guide", label: "Equipment" },
  { href: "/about", label: "Clubs" },
  { href: "/contact", label: "Contact" },
];

export function SiteNav({ user, cartCount }: { user: { name: string; role: string } | null; cartCount: number }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const overHero = pathname === "/" && !scrolled;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const dashboard = user && (user.role === "owner" || user.role === "admin") ? "/admin/overview" : "/member/dashboard";

  return (
    <header className={cn("fixed inset-x-0 top-0 z-50 transition-all duration-300", overHero ? "bg-transparent text-white" : "glass text-foreground shadow-sm")}>
      <div className="container-x flex h-16 items-center justify-between lg:h-20">
        <Link href="/" className="font-heading text-xl font-extrabold tracking-tight lg:text-2xl">
          FORGE<span className="text-primary">FIT</span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className={cn("text-sm font-medium opacity-80 transition hover:text-primary hover:opacity-100", pathname.startsWith(l.href) && "text-primary opacity-100")}>
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <Button variant="ghost" size="icon" aria-label="Toggle theme" className="hover:bg-white/10" onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}>
            {/* Both icons render; CSS picks one so server and client HTML match. */}
            <Sun className="hidden h-4 w-4 dark:block" />
            <Moon className="h-4 w-4 dark:hidden" />
          </Button>
          <Link href="/cart" aria-label="Cart" className="relative inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-white/10">
            <ShoppingBag className="h-4 w-4" />
            {cartCount > 0 && <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">{cartCount}</span>}
          </Link>
          {user ? (
            <>
              <Button asChild size="sm" variant={overHero ? "secondary" : "outline"} className="hidden sm:inline-flex">
                <Link href={dashboard}><LayoutDashboard className="mr-1.5 h-4 w-4" />Dashboard</Link>
              </Button>
              <Button variant="ghost" size="icon" aria-label="Sign out" className="hidden hover:bg-white/10 sm:inline-flex" onClick={async () => { await signOut(); router.push("/"); router.refresh(); }}>
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Link href="/login" className="hidden px-3 text-sm font-medium opacity-80 hover:opacity-100 sm:inline">Sign in</Link>
              <Button asChild size="sm" className="hidden sm:inline-flex"><Link href="/register">Join now</Link></Button>
            </>
          )}
          <Button variant="ghost" size="icon" className="lg:hidden hover:bg-white/10" aria-label="Menu" onClick={() => setOpen(!open)}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {open && (
        <div className="border-t bg-background text-foreground lg:hidden">
          <div className="container-x flex flex-col gap-1 py-4">
            {links.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="py-2.5 text-sm font-medium hover:text-primary">{l.label}</Link>
            ))}
            {user ? (
              <Button asChild className="mt-3"><Link href={dashboard} onClick={() => setOpen(false)}>Dashboard</Link></Button>
            ) : (
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Button asChild variant="outline"><Link href="/login" onClick={() => setOpen(false)}>Sign in</Link></Button>
                <Button asChild><Link href="/register" onClick={() => setOpen(false)}>Join now</Link></Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
