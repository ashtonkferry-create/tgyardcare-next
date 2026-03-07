import type { Metadata } from "next";
import AdminLayout from "@/components/admin/AdminLayout";
import SEOManager from "@/components/admin/SEOManager";

export const metadata: Metadata = {
  title: "SEO Manager - Admin Dashboard",
  robots: { index: false, follow: false },
};

export default function AdminSEOManagerPage() {
  return (
    <AdminLayout title="SEO Manager">
      <SEOManager />
    </AdminLayout>
  );
}
