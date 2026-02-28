'use client';

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Session } from "@supabase/supabase-js";
import {
  LogOut,
  LayoutDashboard,
  Search,
  MapPin,
  Users,
  MousePointerClick,
  Wrench,
  Menu,
  X,
  Tag,
  FileSearch,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
}

const checkAdminRole = async (userId: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .single();

  return !error && !!data;
};

const navItems = [
  { path: "/admin", label: "Overview", icon: LayoutDashboard },
  { path: "/admin/promos", label: "Promotions", icon: Tag },
  { path: "/admin/seo-manager", label: "SEO Manager", icon: FileSearch },
  { path: "/admin/seo", label: "SEO & Keywords", icon: Search },
  { path: "/admin/local", label: "Local / GBP", icon: MapPin },
  { path: "/admin/leads", label: "Leads", icon: Users },
  { path: "/admin/events", label: "Event Tracking", icon: MousePointerClick },
  { path: "/admin/tools", label: "Admin Tools", icon: Wrench },
];

export default function AdminLayout({ children, title }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        router.push("/admin/login");
        return;
      }

      const isAdmin = await checkAdminRole(session.user.id);
      if (!isAdmin) {
        router.push("/admin/login");
        toast.error("Unauthorized access - admin role required");
        return;
      }

      setSession(session);
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        router.push("/admin/login");
        return;
      }

      setTimeout(async () => {
        const isAdmin = await checkAdminRole(session.user.id);
        if (!isAdmin) {
          router.push("/admin/login");
          toast.error("Unauthorized access - admin role required");
          return;
        }
        setSession(session);
        setIsLoading(false);
      }, 0);
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
    toast.success("Logged out successfully");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-background">
        {/* Top Header */}
        <header className="sticky top-0 z-50 bg-card border-b border-border">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
              <h1 className="text-xl font-bold text-foreground">TG Admin</h1>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground hidden sm:block">
                {session?.user?.email}
              </span>
              <Button onClick={handleLogout} variant="ghost" size="sm" className="gap-2">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </header>

        <div className="flex">
          {/* Sidebar Navigation */}
          <nav
            className={cn(
              "fixed md:sticky top-[57px] left-0 h-[calc(100vh-57px)] w-64 bg-card border-r border-border p-4 transition-transform z-40",
              mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
            )}
          >
            <ul className="space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.path;
                return (
                  <li key={item.path}>
                    <Button
                      variant={isActive ? "secondary" : "ghost"}
                      className={cn(
                        "w-full justify-start gap-3",
                        isActive && "bg-primary/10 text-primary"
                      )}
                      onClick={() => {
                        router.push(item.path);
                        setMobileMenuOpen(false);
                      }}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Button>
                  </li>
                );
              })}
            </ul>

            <div className="mt-8 pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground mb-2">Legacy Tools</p>
              <ul className="space-y-1">
                <li>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-xs"
                    onClick={() => router.push("/admin/performance")}
                  >
                    Performance
                  </Button>
                </li>
                <li>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-xs"
                    onClick={() => router.push("/admin/image-optimizer")}
                  >
                    Image Optimizer
                  </Button>
                </li>
                <li>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-xs"
                    onClick={() => router.push("/admin/gallery")}
                  >
                    Gallery Manager
                  </Button>
                </li>
              </ul>
            </div>
          </nav>

          {/* Mobile overlay */}
          {mobileMenuOpen && (
            <div
              className="fixed inset-0 bg-black/50 z-30 md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
          )}

          {/* Main Content */}
          <main className="flex-1 p-4 md:p-6 min-h-[calc(100vh-57px)]">
            <div className="max-w-7xl mx-auto">{children}</div>
          </main>
        </div>
      </div>
    </>
  );
}
