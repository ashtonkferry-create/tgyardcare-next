import type { Metadata } from "next";
import AdminLayout from "@/components/admin/AdminLayout";
import LocalGBPPanel from "@/components/admin/LocalGBPPanel";

export const metadata: Metadata = {
  title: "Local / GBP - Admin Dashboard",
  robots: { index: false, follow: false },
};

export default function AdminLocal() {
  return (
    <AdminLayout title="Local / GBP">
      <LocalGBPPanel />
    </AdminLayout>
  );
}
