export const SITE_CONFIG = {
  name: "Forge Fit",
  description: "Premium Gym Management & E-Commerce Web Application",
  url: "https://forgefit.example.com",
};

export const MEMBERSHIP_TIERS = [
  {
    id: "basic",
    name: "Basic",
    price: 1499,
    facilities: ["Gym floor access", "Locker room"],
    features: ["Standard support", "Cancel anytime"],
  },
  {
    id: "pro",
    name: "Pro",
    price: 2999,
    facilities: ["Gym floor access", "Locker room", "Sauna", "Group classes"],
    features: ["Priority support", "Free guest pass monthly", "1 PT session/month"],
  },
  {
    id: "elite",
    name: "Elite",
    price: 4999,
    facilities: ["All facilities", "Private locker", "Recovery zone"],
    features: ["24/7 dedicated support", "Unlimited guest passes", "4 PT sessions/month", "Nutrition plan"],
  },
];

export const MUSCLE_GROUPS = [
  "Chest",
  "Back",
  "Legs",
  "Arms",
  "Shoulders",
  "Core",
  "Full Body",
];

export const PRODUCT_CATEGORIES = [
  "Supplements",
  "Apparel",
  "Accessories",
  "Equipment",
  "Digital Plans",
];

export const ROLES = {
  ADMIN: "ADMIN",
  TRAINER: "TRAINER",
  MEMBER: "MEMBER",
} as const;

export const NAV_ITEMS = {
  admin: [
    { label: "Dashboard", href: "/admin", icon: "LayoutDashboard" },
    { label: "Members", href: "/admin/members", icon: "Users" },
    { label: "Products", href: "/admin/products", icon: "Package" },
    { label: "Orders", href: "/admin/orders", icon: "ShoppingCart" },
    { label: "Settings", href: "/admin/settings", icon: "Settings" },
  ],
  member: [
    { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
    { label: "My Plan", href: "/dashboard/plan", icon: "CreditCard" },
    { label: "Workouts", href: "/dashboard/workouts", icon: "Dumbbell" },
    { label: "Shop", href: "/shop", icon: "Store" },
    { label: "Orders", href: "/dashboard/orders", icon: "Package" },
    { label: "Settings", href: "/dashboard/settings", icon: "Settings" },
  ],
};
