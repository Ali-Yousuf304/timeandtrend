import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Sparkles, Truck } from "lucide-react";
import heroWatch from "@/assets/hero-watch.jpg";
import { products, bestSellers } from "@/data/products";
import { ProductCard } from "@/components/site/ProductCard";
import { CollectionsPreview } from "@/components/site/CollectionsPreview";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Time & Trend — Luxury Watches for Every Occasion" },
      {
        name: "description",
        content:
          "Discover premium timepieces curated for those who value timeless design and exceptional craftsmanship.",
      },
      { property: "og:title", content: "Time & Trend — Luxury Watches" },
      {
        property: "og:description",
        content: "Discover premium timepieces curated for every occasion.",
      },
    ],
  }),
  component: HomePage,
});

const features = [
  {
    icon: Sparkles,
    title: "Premium Quality",
    desc: "Every watch is crafted from the finest materials and undergoes rigorous quality checks.",
  },
  {
    icon: Truck,
    title: "Secure Shipping",
    desc: "Insured and tracked shipping worldwide, so your new timepiece arrives safely.",
  },
  {
    icon: ShieldCheck,
    title: "7-Day Returns",
    desc: "Hassle-free return policy to ensure your complete satisfaction.",
  },
];

function HomePage() {
  const featured = products.slice(0, 3);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-secondary to-background">
        <div className="mx-auto grid min-h-[88vh] max-w-[1400px] items-center gap-10 px-6 py-16 md:grid-cols-2 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center md:text-left"
          >
            <span className="inline-block text-xs font-semibold uppercase tracking-[0.3em] text-[var(--gold)]">
              Est. 2025 — Swiss Crafted
            </span>
            <h1 className="mt-4 font-display text-5xl leading-tight md:text-6xl lg:text-7xl">
              Discover <span className="italic text-[var(--gold)]">Premium</span> Timepieces
            </h1>
            <p className="mx-auto mt-5 max-w-md text-base text-muted-foreground md:mx-0">
              Curated luxury watches for every occasion. Engineered for those who measure life
              in moments, not minutes.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row md:justify-start">
              <Link
                to="/collections"
                className="group inline-flex items-center justify-center gap-2 rounded-md bg-[var(--gold)] px-6 py-3 text-sm font-semibold text-[var(--gold-foreground)] shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg"
              >
                Shop Now
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/collections"
                className="inline-flex items-center justify-center rounded-md border-2 border-[var(--gold)] px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-[var(--gold)] hover:text-[var(--gold-foreground)]"
              >
                View Collections
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute -inset-8 rounded-full bg-[var(--gold)]/10 blur-3xl" />
            <motion.img
              src={heroWatch}
              alt="Luxury watch"
              width={1280}
              height={896}
              className="relative w-full rounded-2xl object-cover shadow-2xl"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>
        </div>
      </section>

      {/* Featured */}
      <section className="py-20">
        <div className="mx-auto max-w-[1200px] px-6 md:px-8">
          <h2 className="section-title">Featured Pieces</h2>
          <div className="section-title-underline" />
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link
              to="/collections"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--gold)] hover:underline"
            >
              View all collections <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Collections (filterable carousel) */}
      <section className="bg-secondary/40">
        <CollectionsPreview />
      </section>

      {/* Best Sellers preview */}
      <section className="bg-secondary py-20">
        <div className="mx-auto max-w-[1200px] px-6 md:px-8">
          <h2 className="section-title">This Season's Best Sellers</h2>
          <div className="section-title-underline" />
          <div className="grid gap-6 md:grid-cols-2">
            {bestSellers.map((p) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="flex gap-5 rounded-xl bg-card p-5 shadow-sm"
              >
                <div className="h-32 w-32 flex-shrink-0 rounded-lg bg-muted p-2">
                  <img src={p.image} alt={p.name} className="h-full w-full object-contain" />
                </div>
                <div className="flex flex-col justify-center">
                  <div className="text-[var(--gold)]">
                    {"★".repeat(p.rating)}
                    <span className="text-muted-foreground/40">{"★".repeat(5 - p.rating)}</span>
                  </div>
                  <h3 className="mt-1 font-display text-lg font-semibold">{p.name}</h3>
                  <p className="text-sm text-muted-foreground">{p.tagline}</p>
                  <p className="mt-2 font-bold text-[var(--gold)]">
                    ${p.price.toLocaleString()}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About snapshot */}
      <section className="bg-[var(--ink)] py-20 text-[var(--ink-foreground)]">
        <div className="mx-auto grid max-w-[1200px] gap-12 px-6 md:grid-cols-2 md:px-8">
          <div>
            <h2 className="font-display text-4xl">
              Luxury on Your Wrist, <span className="italic text-[var(--gold)]">Every Day.</span>
            </h2>
            <div className="mt-3 h-[3px] w-16 bg-[var(--gold)]" />
            <p className="mt-6 text-white/70">
              Time & Trend was founded on the belief that a beautiful timepiece is more than just
              an accessory—it's a statement. Every piece we offer is a testament to both
              innovation and tradition.
            </p>
            <Link
              to="/about"
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[var(--gold)] hover:underline"
            >
              Read our story <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-6">
            {features.map((f) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="flex gap-4 rounded-lg border border-white/10 bg-white/5 p-5"
              >
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[var(--gold)]/15 text-[var(--gold)]">
                  <f.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-semibold text-white">{f.title}</h3>
                  <p className="mt-1 text-sm text-white/70">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
