export type AdminNavItem = {
  href: string;
  label: string;
  title: string;
  description: string;
};

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    title: "Dashboard",
    description:
      "Overview of platform administration. More tools will land here.",
  },
  {
    href: "/tasks",
    label: "Tasks",
    title: "Tasks",
    description:
      "Manage the fixed task menu used when communities create escrows.",
  },
  {
    href: "/communities",
    label: "Communities",
    title: "Communities",
    description:
      "Review and manage community accounts that participate in the escrow pilot.",
  },
];

export function getAdminNavItem(pathname: string): AdminNavItem {
  const match = ADMIN_NAV_ITEMS.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  );
  return match ?? ADMIN_NAV_ITEMS[0]!;
}
