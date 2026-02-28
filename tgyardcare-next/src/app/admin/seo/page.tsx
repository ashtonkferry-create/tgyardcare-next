import type { Metadata } from "next";
import AdminLayout from "@/components/admin/AdminLayout";
import SEOPanel from "@/components/admin/SEOPanel";

export const metadata: Metadata = {
  title: "SEO & Keywords - Admin Dashboard",
  robots: { index: false, follow: false },
};

export default function AdminSEO() {
  return (
    <AdminLayout title="SEO & Keywords">
      <SEOPanel />
    </AdminLayout>
  );
}
