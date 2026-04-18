import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ShieldCheck, Sparkles, Truck } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Time & Trend" },
      {
        name: "description",
        content:
          "The story behind Time & Trend — a house dedicated to crafting watches of exceptional quality and timeless design.",
      },
      { property: "og:title", content: "About — Time & Trend" },
      {
        property: "og:description",
        content: "The story behind Time & Trend luxury watches.",
      },
    ],
  }),
  component: AboutPage,
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
    desc: "We offer a hassle-free return policy to ensure your complete satisfaction.",
  },
];

function AboutPage() {
  return (
    <section className="bg-[var(--ink)] py-20 text-[var(--ink-foreground)]">
      <div className="mx-auto grid max-w-[1200px] gap-12 px-6 md:grid-cols-2 md:px-8 md:gap-16">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <h1 className="font-display text-4xl md:text-5xl">
            Luxury on Your Wrist,{" "}
            <span className="italic text-[var(--gold)]">Every Day.</span>
          </h1>
          <div className="mt-4 h-[3px] w-16 bg-[var(--gold)]" />
          <p className="mt-8 text-white/70">
            Time & Trend was founded on the belief that a beautiful timepiece is more than just
            an accessory—it's a statement. We are dedicated to curating and crafting watches of
            exceptional quality and timeless design.
          </p>
          <p className="mt-4 text-white/70">
            Every piece we offer is a testament to both innovation and tradition, made for those
            who measure life not in minutes, but in moments worth remembering.
          </p>
        </motion.div>

        <div className="flex flex-col gap-5">
          {features.map((f, idx) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="flex gap-4 rounded-xl border border-white/10 bg-white/5 p-6"
            >
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[var(--gold)]/15 text-[var(--gold)]">
                <f.icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display text-xl font-semibold text-white">{f.title}</h3>
                <p className="mt-1 text-sm text-white/70">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
