import * as React from "react";
import { createFileRoute, Outlet, useNavigate, Link, useLocation } from "@tanstack/react-router";
import { useAuth } from "@/context/AuthContext";
import { ShieldAlert, Menu, X, ArrowLeft } from "lucide-react";
import { AdminSidebar, adminNavItems } from "@/components/admin/AdminSidebar";
import { ThemeToggle } from "@/components/site/ThemeToggle";
import { useSiteSettings } from "@/hooks/use-settings";
import { cn } from "@/lib/utils";

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
  const { settings } = useSiteSettings();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = React.useState(false);

  React.useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [user, loading, navigate]);

  // Close mobile menu on route change
  React.useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

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
    <div className="min-h-screen bg-background">
      {/* Admin top bar */}
      <header className="sticky top-0 z-40 border-b border-border bg-card">
        <div className="flex h-[64px] items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Toggle admin menu"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-foreground hover:bg-muted md:hidden"
            >
              {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
            <Link to="/admin" className="flex items-center gap-2">
              {settings?.logo_url ? (
                <img
                  src={settings.logo_url}
                  alt="Logo"
                  className="h-8 max-w-[140px] object-contain"
                />
              ) : (
                <span className="font-display text-lg font-bold tracking-tight">
                  Time <span className="text-[var(--gold)]">&amp;</span> Trend
                </span>
              )}
              <span className="hidden text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground sm:inline">
                Admin
              </span>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="flex">
        <AdminSidebar />

        {/* Mobile drawer */}
        {menuOpen && (
          <div
            className="fixed inset-0 z-50 md:hidden"
            onClick={() => setMenuOpen(false)}
          >
            <div className="absolute inset-0 bg-black/50" />
            <aside
              className="absolute left-0 top-0 h-full w-72 max-w-[85vw] overflow-y-auto border-r border-border bg-card shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex h-[64px] items-center justify-between border-b border-border px-4">
                <span className="font-display text-base font-bold">Menu</span>
                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  aria-label="Close menu"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-muted"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <nav className="flex flex-col gap-1 p-3">
                {adminNavItems.map((item) => {
                  const active = item.exact
                    ? pathname === item.to
                    : pathname === item.to || pathname.startsWith(`${item.to}/`);
                  return (
                    <Link
                      key={item.to}
                      to={item.to as "/admin"}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                        active
                          ? "bg-[var(--gold)]/15 text-[var(--gold)]"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  );
                })}
                <div className="mt-2 border-t border-border pt-2">
                  <Link
                    to="/"
                    className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <ArrowLeft className="h-4 w-4" /> Back to store
                  </Link>
                </div>
              </nav>
            </aside>
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="mx-auto max-w-[1100px] px-6 py-8 md:px-10">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
