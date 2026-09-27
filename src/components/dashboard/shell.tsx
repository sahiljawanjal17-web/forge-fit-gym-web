"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  BarChart3, Bot, CreditCard, Dumbbell, Home, LayoutDashboard, LogOut, Menu, MessageCircle, Package, Settings, ShoppingBag, ShoppingCart, Ticket, User, Users, Warehouse, X,
} from "lucide-react";
import { signOut } from "@/lib/auth/client";
import { cn } from "@/lib/utils";

const ICONS = { BarChart3, Bot, CreditCard, Dumbbell, Home, LayoutDashboard, MessageCircle, Package, Settings, ShoppingBag, ShoppingCart, Ticket, User, Users, Warehouse };
export type NavItem = { label: string; href: string; icon: keyof typeof ICONS; badge?: number };

export function DashboardShell({ nav, user, title, children }: { nav: NavItem[]; user: { name: string; email: string; role: string }; title: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center justify-between px-5">
        <Link href="/" className="font-heading text-xl font-extrabold">FORGE<span className="text-primary">FIT</span></Link>
        <button className="lg:hidden" onClick={() => setOpen(false)} aria-label="Close menu"><X className="h-5 w-5" /></button>
      </div>
      <p className="px-5 pb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">{title}</p>
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3">
        {nav.map((item) => {
          const Icon = ICONS[item.icon];
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
              className={cn("flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition", active ? "bg-primary/10 font-semibold text-primary" : "text-muted-foreground hover:bg-accent hover:text-foreground")}>
              <Icon className="h-4 w-4" />{item.label}
              {!!item.badge && <span className="ml-auto rounded-full bg-primary px-2 text-[10px] font-bold text-primary-foreground">{item.badge}</span>}
            </Link>
          );
        })}
      </nav>
      <div className="border-t p-3">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">{user.name.slice(0, 1).toUpperCase()}</div>
          <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{user.name}</p><p className="truncate text-xs text-muted-foreground">{user.email}</p></div>
          <button aria-label="Sign out" className="text-muted-foreground hover:text-foreground" onClick={async () => { await signOut(); router.push("/"); router.refresh(); }}><LogOut className="h-4 w-4" /></button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r bg-card lg:block">{sidebar}</aside>
      {open && <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setOpen(false)} />}
      <aside className={cn("fixed inset-y-0 left-0 z-50 w-64 border-r bg-card transition-transform lg:hidden", open ? "translate-x-0" : "-translate-x-full")}>{sidebar}</aside>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur lg:hidden">
          <button onClick={() => setOpen(true)} aria-label="Open menu"><Menu className="h-5 w-5" /></button>
          <span className="font-heading font-extrabold">FORGE<span className="text-primary">FIT</span></span>
        </header>
        <main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

export function PageTitle({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-3xl font-extrabold">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatCard({ label, value, hint, tone }: { label: string; value: string; hint?: string; tone?: "up" | "down" | "warn" }) {
  return (
    <div className="rounded-xl border bg-card p-5">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-2 font-heading text-3xl font-extrabold tabular-nums">{value}</p>
      {hint && <p className={cn("mt-1 text-xs", tone === "up" ? "text-success" : tone === "down" ? "text-destructive" : tone === "warn" ? "text-warning" : "text-muted-foreground")}>{hint}</p>}
    </div>
  );
}

const STATUS_TONE: Record<string, string> = {
  active: "bg-success/15 text-success", delivered: "bg-success/15 text-success", succeeded: "bg-success/15 text-success", paid: "bg-success/15 text-success", low: "bg-success/15 text-success",
  pending: "bg-warning/15 text-warning", processing: "bg-warning/15 text-warning", paused: "bg-warning/15 text-warning", unpaid: "bg-warning/15 text-warning", medium: "bg-warning/15 text-warning", low_stock: "bg-warning/15 text-warning", needs_maintenance: "bg-warning/15 text-warning",
  shipped: "bg-primary/15 text-primary",
  cancelled: "bg-destructive/15 text-destructive", expired: "bg-destructive/15 text-destructive", failed: "bg-destructive/15 text-destructive", refunded: "bg-destructive/15 text-destructive", high: "bg-destructive/15 text-destructive", churned: "bg-destructive/15 text-destructive", out_of_service: "bg-destructive/15 text-destructive",
};

export function StatusBadge({ status }: { status: string }) {
  return <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em]", STATUS_TONE[status] ?? "bg-muted text-muted-foreground")}>{status.replace(/_/g, " ")}</span>;
}
