import type { Metadata } from "next";
import AdminLayout from "@/components/admin/AdminLayout";
import LeadsPanel from "@/components/admin/LeadsPanel";

export const metadata: Metadata = {
  title: "Leads - Admin Dashboard",
  robots: { index: false, follow: false },
};

export default function AdminLeads() {
  return (
    <AdminLayout title="Leads">
      <LeadsPanel />
    </AdminLayout>
  );
}
