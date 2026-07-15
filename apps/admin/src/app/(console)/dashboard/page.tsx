import { AdminPageScaffold } from "@/features/admin-shell/components/AdminPageScaffold";
import { ADMIN_NAV_ITEMS } from "@/features/admin-shell/constants/nav";

export default function DashboardPage() {
  const item = ADMIN_NAV_ITEMS[0]!;

  return (
    <AdminPageScaffold title={item.title} description={item.description} />
  );
}
