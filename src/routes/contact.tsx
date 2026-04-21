import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Mail, MapPin, Phone } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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

const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters"),
  email: z
    .string()
    .trim()
    .email("Invalid email address")
    .max(255, "Email must be less than 255 characters"),
  message: z
    .string()
    .trim()
    .min(5, "Message is too short")
    .max(2000, "Message must be less than 2000 characters"),
});

function ContactPage() {
  const [submitting, setSubmitting] = React.useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const parsed = contactSchema.safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
      message: formData.get("message"),
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from("customer_queries").insert({
      name: parsed.data.name,
      email: parsed.data.email,
      message: parsed.data.message,
    });
    setSubmitting(false);

    if (error) {
      toast.error("Failed to send message. Please try again.");
      return;
    }
    toast.success("Message sent! We'll get back to you within 24 hours.");
    form.reset();
  };

  const contacts = [
    { icon: Mail, label: "timeandtrend000@gmail.com", href: "mailto:timeandtrend000@gmail.com" },
    { icon: Phone, label: "+92 331 0006549", href: "https://wa.me/923310006549" },
    { icon: MapPin, label: "Karachi, Pakistan" },
  ];

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
            {contacts.map((c) => {
              const inner = (
                <>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--gold)]/10 text-[var(--gold)]">
                    <c.icon className="h-4 w-4" />
                  </div>
                  <span className="text-sm">{c.label}</span>
                </>
              );
              return c.href ? (
                <a
                  key={c.label}
                  href={c.href}
                  target={c.href.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 transition-colors hover:text-[var(--gold)]"
                >
                  {inner}
                </a>
              ) : (
                <div key={c.label} className="flex items-center gap-3">
                  {inner}
                </div>
              );
            })}
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
                <Input
                  id="name"
                  name="name"
                  required
                  maxLength={100}
                  className="mt-2"
                  placeholder="Jane Doe"
                />
              </div>
              <div>
                <Label htmlFor="email">Your Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  maxLength={255}
                  className="mt-2"
                  placeholder="jane@example.com"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="message">Your Message</Label>
              <textarea
                id="message"
                name="message"
                required
                maxLength={2000}
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
