import { DashboardShell, type NavItem } from "@/components/dashboard/shell";
import { requireUser } from "@/lib/auth";

const nav: NavItem[] = [
  { label: "Dashboard", href: "/member/dashboard", icon: "LayoutDashboard" },
  { label: "Forge AI", href: "/member/ai", icon: "Bot" },
  { label: "Membership", href: "/member/membership", icon: "Ticket" },
  { label: "Orders", href: "/member/orders", icon: "Package" },
  { label: "Store", href: "/shop", icon: "ShoppingBag" },
  { label: "Equipment guide", href: "/member/equipment-guide", icon: "Dumbbell" },
  { label: "Message club", href: "/member/chat", icon: "MessageCircle" },
  { label: "Profile", href: "/member/profile", icon: "User" },
  { label: "Back to site", href: "/", icon: "Home" },
];

export default async function MemberLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return <DashboardShell nav={nav} title="Member area" user={{ name: user.name, email: user.email, role: user.role ?? "customer" }}>{children}</DashboardShell>;
}
