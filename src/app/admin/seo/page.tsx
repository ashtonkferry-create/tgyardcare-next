import type { Metadata } from "next";
import AdminLayout from "@/components/admin/AdminLayout";
import SEOIntelligence from "@/components/admin/SEOIntelligence";

export const metadata: Metadata = {
  title: "SEO Intelligence - TG Admin",
  robots: { index: false, follow: false },
};

export default function SEOPage() {
  return (
    <AdminLayout title="SEO Intelligence">
      <SEOIntelligence />
    </AdminLayout>
  );
}
