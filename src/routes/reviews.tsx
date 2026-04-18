import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";

export const Route = createFileRoute("/reviews")({
  head: () => ({
    meta: [
      { title: "Reviews — Time & Trend" },
      {
        name: "description",
        content: "Read what our customers say about their Time & Trend timepieces.",
      },
      { property: "og:title", content: "Reviews — Time & Trend" },
      {
        property: "og:description",
        content: "Customer reviews of our luxury watches.",
      },
    ],
  }),
  component: ReviewsPage,
});

const testimonials = [
  {
    text: "The attention to detail is unmatched. My watch is a timeless piece of art. The shopping experience was as luxurious as the watch itself.",
    author: "Alex Johnson",
  },
  {
    text: "From the moment I unboxed it, I knew I made the right choice. Time & Trend defines elegance and quality. Highly recommended.",
    author: "Samantha Reed",
  },
  {
    text: "Fantastic customer service and an even better product. The watch feels incredible on my wrist. Will definitely be a returning customer.",
    author: "Michael Chen",
  },
  {
    text: "The Lumière Diamond is breathtaking. It catches the light perfectly and feels feather-light. A piece I'll cherish for years.",
    author: "Priya Mehta",
  },
];

function ReviewsPage() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-[1200px] px-6 md:px-8">
        <h1 className="section-title">What Our Customers Say</h1>
        <div className="section-title-underline" />

        <div className="grid gap-6 md:grid-cols-2">
          {testimonials.map((t, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.08 }}
              className="rounded-xl border-l-4 border-[var(--gold)] bg-secondary p-8"
            >
              <div className="text-xl text-[var(--gold)]">★★★★★</div>
              <p className="mt-4 italic text-muted-foreground">"{t.text}"</p>
              <p className="mt-4 text-right font-display text-base font-semibold">— {t.author}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
