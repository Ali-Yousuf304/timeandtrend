import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Mail, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Time & Trend" },
      {
        name: "description",
        content: "Get in touch with the Time & Trend team. We'd love to hear from you.",
      },
      { property: "og:title", content: "Contact — Time & Trend" },
      {
        property: "og:description",
        content: "Get in touch with the Time & Trend team.",
      },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [submitting, setSubmitting] = React.useState(false);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      toast.success("Message sent! We'll get back to you within 24 hours.");
      (e.target as HTMLFormElement).reset();
    }, 700);
  };

  return (
    <section className="py-20">
      <div className="mx-auto max-w-[1100px] px-6 md:px-8">
        <h1 className="section-title">Get In Touch</h1>
        <div className="section-title-underline" />

        <div className="grid gap-10 md:grid-cols-[1fr_1.4fr]">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <p className="text-muted-foreground">
              Have a question about a piece, an order, or our craftsmanship? Our concierge team
              is here to help.
            </p>
            {[
              { icon: Mail, label: "concierge@timeandtrend.com" },
              { icon: Phone, label: "+1 (212) 555-0142" },
              { icon: MapPin, label: "Fifth Avenue Atelier, New York" },
            ].map((c) => (
              <div key={c.label} className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--gold)]/10 text-[var(--gold)]">
                  <c.icon className="h-4 w-4" />
                </div>
                <span className="text-sm">{c.label}</span>
              </div>
            ))}
          </motion.div>

          <motion.form
            onSubmit={onSubmit}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-sm md:p-8"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="name">Your Name</Label>
                <Input id="name" required className="mt-2" placeholder="Jane Doe" />
              </div>
              <div>
                <Label htmlFor="email">Your Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  className="mt-2"
                  placeholder="jane@example.com"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="message">Your Message</Label>
              <textarea
                id="message"
                required
                rows={6}
                placeholder="Tell us how we can help..."
                className="mt-2 flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-[var(--gold)] text-[var(--gold-foreground)] hover:bg-[var(--gold)]/90 sm:w-auto"
              size="lg"
            >
              {submitting ? "Sending..." : "Send Message"}
            </Button>
          </motion.form>
        </div>
      </div>
    </section>
  );
}
