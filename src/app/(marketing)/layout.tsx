import { getSession, isStaff } from "@/lib/auth";
import { getCart } from "@/server/services/store";
import { SiteNav } from "@/components/layout/site-nav";
import { SiteFooter } from "@/components/layout/site-footer";
import { AiWidget } from "@/components/ai/ai-widget";

export default async function MarketingLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  const user = session?.user ?? null;
  const cartCount = user ? (await getCart(user.id)).count : 0;
  return (
    <>
      <SiteNav user={user && { name: user.name, role: user.role ?? "customer" }} cartCount={cartCount} />
      <main className="min-h-screen">{children}</main>
      <SiteFooter />
      <AiWidget role={user ? (isStaff(user.role) ? "owner" : "customer") : null} />
    </>
  );
}
