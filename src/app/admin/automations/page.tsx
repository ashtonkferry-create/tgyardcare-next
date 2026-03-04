import type { Metadata } from "next";
import AdminLayout from "@/components/admin/AdminLayout";
import AutomationsPanel from "@/components/admin/AutomationsPanel";

export const metadata: Metadata = {
  title: "Automations - TG Admin",
  robots: { index: false, follow: false },
};

export default function AutomationsPage() {
  return (
    <AdminLayout title="Automation Engine">
      <AutomationsPanel />
    </AdminLayout>
  );
}
