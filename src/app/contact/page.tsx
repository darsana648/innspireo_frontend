import type { Metadata } from "next";
import Link from "next/link";
import { Mail, Phone, MapPin, Clock, MessageCircle, ArrowRight } from "lucide-react";
import { EnquiryForm } from "@/components/forms/enquiry-form";
import { Card, Section, SectionHeading, Badge } from "@/components/ui/primitives";
import { buttonClass } from "@/components/ui/button";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Contact the Innspireo recruitment desk in Kochi for candidate or employer enquiries about hospitality placement in the Gulf and Europe.",
  alternates: { canonical: "/contact" },
};

const CHANNELS = [
  {
    icon: <Mail />,
    label: "Email",
    value: SITE.email,
    href: `mailto:${SITE.email}`,
    note: "Replies within one working day",
  },
  {
    icon: <Phone />,
    label: "Phone",
    value: SITE.phone,
    href: `tel:${SITE.phoneHref}`,
    note: "Gulf and European hours",
  },
  {
    icon: <MessageCircle />,
    label: "WhatsApp",
    value: SITE.phone,
    href: `https://wa.me/${SITE.phoneHref.replace(/\D/g, "")}`,
    note: "Fastest for quick questions",
  },
];

export default function ContactPage() {
  return (
    <>
      <section className="border-b border-line bg-surface-muted">
        <div className="container-page py-12 sm:py-16">
          <Badge tone="brand">Get in touch</Badge>
          <h1 className="mt-4 max-w-2xl text-3xl text-content sm:text-4xl">
            Talk to our recruitment desk
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-content-muted">
            Whether you are looking for a role or looking to hire, you will reach the same
            team in Kochi who manage placements end to end.
          </p>
        </div>
      </section>

      <Section>
        <div className="grid gap-12 lg:grid-cols-[1fr_22rem]">
          <div className="min-w-0">
            <SectionHeading
              eyebrow="Send a message"
              title="How can we help?"
              description="Tell us a little about your situation and the right person will come back to you."
            />
            <div className="mt-8">
              <EnquiryForm mode="contact" />
            </div>
          </div>

          <aside className="space-y-5">
            {CHANNELS.map((c) => (
              <Card key={c.label} className="p-5">
                <div className="flex items-start gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-none bg-brand-50 text-brand-600 [&_svg]:size-4.5">
                    {c.icon}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs text-content-subtle">{c.label}</p>
                    <a
                      href={c.href}
                      target={c.href.startsWith("http") ? "_blank" : undefined}
                      rel={c.href.startsWith("http") ? "noopener noreferrer" : undefined}
                      className="mt-0.5 block break-all text-sm font-semibold text-brand-600 hover:underline"
                    >
                      {c.value}
                    </a>
                    <p className="mt-1 text-xs text-content-subtle">{c.note}</p>
                  </div>
                </div>
              </Card>
            ))}

            <Card className="p-5">
              <h2 className="inline-flex items-center gap-2 text-base text-content">
                <MapPin className="size-4 text-brand-600" />
                Office
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-content-muted">
                {SITE.address}
              </p>
              <p className="mt-4 inline-flex items-center gap-2 text-xs text-content-subtle">
                <Clock className="size-3.5" />
                Monday to Saturday, 9:30am to 6:30pm IST
              </p>
            </Card>

            <Card className="p-5">
              <h2 className="text-base text-content">Hiring staff?</h2>
              <p className="mt-2 text-sm leading-relaxed text-content-muted">
                Employers get a faster response through the dedicated hiring brief form.
              </p>
              <Link href="/hire-with-us" className={buttonClass("outline", "sm", "mt-4 w-full")}>
                Send a hiring brief
                <ArrowRight />
              </Link>
            </Card>
          </aside>
        </div>
      </Section>
    </>
  );
}
