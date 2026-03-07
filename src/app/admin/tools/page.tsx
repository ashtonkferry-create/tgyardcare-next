import type { Metadata } from "next";
import AdminLayout from "@/components/admin/AdminLayout";
import ToolsPanel from "@/components/admin/ToolsPanel";

export const metadata: Metadata = {
  title: "Admin Tools - Admin Dashboard",
  robots: { index: false, follow: false },
};

export default function AdminTools() {
  return (
    <AdminLayout title="Admin Tools">
      <ToolsPanel />
    </AdminLayout>
  );
}
