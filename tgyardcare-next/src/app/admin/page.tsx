import type { Metadata } from "next";
import AdminLayout from "@/components/admin/AdminLayout";
import OverviewPanel from "@/components/admin/OverviewPanel";

export const metadata: Metadata = {
  title: "Overview - Admin Dashboard",
  robots: { index: false, follow: false },
};

export default function AdminOverview() {
  return (
    <AdminLayout title="Overview">
      <OverviewPanel />
    </AdminLayout>
  );
}
