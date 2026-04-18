import * as React from "react";
import { Link, useLocation } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  LayoutList,
  ImageIcon,
  Users,
  Settings,
  Star,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
}

const items: NavItem[] = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { to: "/admin/customers", label: "Customers", icon: Users },
  { to: "/admin/collections", label: "Collections", icon: LayoutList },
  { to: "/admin/banners", label: "Banner", icon: ImageIcon },
  { to: "/admin/reviews", label: "Manage Reviews", icon: Star },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar() {
  const { pathname } = useLocation();

  return (
    <aside className="sticky top-[70px] hidden h-[calc(100vh-70px)] w-56 shrink-0 border-r border-border bg-card md:block">
      <div className="px-4 pb-2 pt-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Admin
        </p>
        <h2 className="mt-1 font-display text-lg font-bold">Control Panel</h2>
      </div>
      <nav className="mt-2 flex flex-col gap-1 px-2">
        {items.map((item) => {
          const active = item.exact
            ? pathname === item.to
            : pathname === item.to || pathname.startsWith(`${item.to}/`);
          return (
            <Link
              key={item.to}
              to={item.to as "/admin"}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
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
      </nav>
      <div className="mt-6 border-t border-border px-2 pt-3">
        <Link
          to="/"
          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to store
        </Link>
      </div>
    </aside>
  );
}

export function AdminMobileNav() {
  const { pathname } = useLocation();
  return (
    <div className="flex gap-2 overflow-x-auto border-b border-border bg-card p-3 md:hidden">
      {items.map((item) => {
        const active = item.exact
          ? pathname === item.to
          : pathname === item.to || pathname.startsWith(`${item.to}/`);
        return (
          <Link
            key={item.to}
            to={item.to as "/admin"}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium",
              active
                ? "bg-[var(--gold)] text-[var(--gold-foreground)]"
                : "bg-muted text-muted-foreground",
            )}
          >
            <item.icon className="h-3.5 w-3.5" />
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
