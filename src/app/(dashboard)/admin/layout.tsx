import { DashboardShell, type NavItem } from "@/components/dashboard/shell";
import { requireStaff } from "@/lib/auth";
import { getKpis } from "@/server/services/analytics";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireStaff();
  const kpis = await getKpis();
  const nav: NavItem[] = [
    { label: "Overview", href: "/admin/overview", icon: "LayoutDashboard" },
    { label: "Forge AI", href: "/admin/ai", icon: "Bot" },
    { label: "Analytics & AI", href: "/admin/analytics", icon: "BarChart3" },
    { label: "Members", href: "/admin/members", icon: "Users" },
    { label: "Memberships", href: "/admin/memberships", icon: "Ticket" },
    { label: "Orders", href: "/admin/orders", icon: "ShoppingCart", badge: kpis.openOrders },
    { label: "Inventory", href: "/admin/inventory", icon: "Warehouse", badge: kpis.lowStockCount },
    { label: "Equipment", href: "/admin/equipment", icon: "Dumbbell" },
    { label: "Payments", href: "/admin/payments", icon: "CreditCard" },
    { label: "Messages", href: "/admin/chat", icon: "MessageCircle" },
    { label: "Settings", href: "/admin/settings", icon: "Settings" },
    { label: "View site", href: "/", icon: "Home" },
  ];
  return <DashboardShell nav={nav} title="Owner console" user={{ name: user.name, email: user.email, role: user.role ?? "owner" }}>{children}</DashboardShell>;
}
