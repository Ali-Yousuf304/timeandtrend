import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { CartProvider } from "@/context/CartContext";
import { CartPanel } from "@/components/site/CartPanel";
import { AuthProvider } from "@/context/AuthContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-[var(--gold)] px-5 py-2 text-sm font-medium text-[var(--gold-foreground)] transition-colors hover:bg-[var(--gold)]/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Time & Trend — Luxury Watches" },
      {
        name: "description",
        content:
          "Curated luxury watches for every occasion. Discover premium timepieces crafted for those who value timeless design.",
      },
      { name: "author", content: "Time & Trend" },
      { property: "og:title", content: "Time & Trend — Luxury Watches" },
      {
        property: "og:description",
        content: "Curated luxury watches for every occasion.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Time & Trend — Luxury Watches" },
      { name: "description", content: "A luxury e-commerce website for watches, featuring dynamic product displays, user accounts, and an admin panel." },
      { property: "og:description", content: "A luxury e-commerce website for watches, featuring dynamic product displays, user accounts, and an admin panel." },
      { name: "twitter:description", content: "A luxury e-commerce website for watches, featuring dynamic product displays, user accounts, and an admin panel." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/e58b79ae-094c-4f63-8f49-a05159dab9ed/id-preview-0bac8556--06a33d24-58ce-46f5-a5ea-6f94d404a965.lovable.app-1776601423638.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/e58b79ae-094c-4f63-8f49-a05159dab9ed/id-preview-0bac8556--06a33d24-58ce-46f5-a5ea-6f94d404a965.lovable.app-1776601423638.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=Playfair+Display:wght@500;600;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <AuthProvider>
      <WishlistProvider>
        <CartProvider>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">
              <Outlet />
            </main>
            <Footer />
            <CartPanel />
            <Toaster />
          </div>
        </CartProvider>
      </WishlistProvider>
    </AuthProvider>
  );
}
