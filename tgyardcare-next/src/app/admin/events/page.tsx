import type { Metadata } from "next";
import AdminLayout from "@/components/admin/AdminLayout";
import EventsPanel from "@/components/admin/EventsPanel";

export const metadata: Metadata = {
  title: "Event Tracking - Admin Dashboard",
  robots: { index: false, follow: false },
};

export default function AdminEvents() {
  return (
    <AdminLayout title="Event Tracking">
      <EventsPanel />
    </AdminLayout>
  );
}
