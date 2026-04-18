import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { bestSellers } from "@/data/products";

export const Route = createFileRoute("/bestsellers")({
  head: () => ({
    meta: [
      { title: "Best Sellers — Time & Trend" },
      {
        name: "description",
        content: "Our most loved luxury timepieces, hand-picked by our customers.",
      },
      { property: "og:title", content: "Best Sellers — Time & Trend" },
      {
        property: "og:description",
        content: "Our most loved luxury timepieces this season.",
      },
    ],
  }),
  component: BestSellersPage,
});

function BestSellersPage() {
  return (
    <section className="bg-secondary py-20">
      <div className="mx-auto max-w-[1200px] px-6 md:px-8">
        <h1 className="section-title">This Season's Best Sellers</h1>
        <div className="section-title-underline" />

        <div className="grid gap-6 md:grid-cols-2">
          {bestSellers.map((p, idx) => (
            <motion.article
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="flex gap-6 rounded-xl bg-card p-6 shadow-sm transition-shadow hover:shadow-lg"
            >
              <div className="h-36 w-36 flex-shrink-0 rounded-lg bg-muted p-3">
                <img src={p.image} alt={p.name} className="h-full w-full object-contain" />
              </div>
              <div className="flex flex-col justify-center">
                <div className="text-[var(--gold)]">
                  {"★".repeat(p.rating)}
                  <span className="text-muted-foreground/40">{"★".repeat(5 - p.rating)}</span>
                </div>
                <h2 className="mt-1 font-display text-xl font-semibold">{p.name}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{p.description}</p>
                <p className="mt-3 font-bold text-[var(--gold)]">
                  ${p.price.toLocaleString()}
                </p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
