import type { Metadata } from "next";
import AdminLayout from "@/components/admin/AdminLayout";
import SiteHealthPanel from "@/components/admin/SiteHealthPanel";

export const metadata: Metadata = {
  title: "Site Health - TG Admin",
  robots: { index: false, follow: false },
};

export default function SiteHealthPage() {
  return (
    <AdminLayout title="Site Health">
      <SiteHealthPanel />
    </AdminLayout>
  );
}
