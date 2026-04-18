import * as React from "react";
import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/context/AuthContext";
import { ShieldAlert } from "lucide-react";
import { AdminSidebar, AdminMobileNav } from "@/components/admin/AdminSidebar";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — Time & Trend" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLayout,
});

function AdminLayout() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [user, loading, navigate]);

  if (loading) {
    return <div className="py-20 text-center text-muted-foreground">Loading…</div>;
  }
  if (!user) return null;
  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-md py-20 text-center">
        <ShieldAlert className="mx-auto h-12 w-12 text-destructive" />
        <h1 className="mt-4 font-display text-2xl font-bold">Access denied</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          You need admin privileges to view this page.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row">
      <AdminSidebar />
      <div className="min-w-0 flex-1">
        <AdminMobileNav />
        <div className="mx-auto max-w-[1100px] px-6 py-8 md:px-10">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
