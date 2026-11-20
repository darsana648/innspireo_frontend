import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Users,
  ShieldCheck,
  GraduationCap,
  Rocket,
  TrendingUp,
  Megaphone,
  Building2,
  Star,
  PartyPopper,
  Check,
} from "lucide-react";
import { Section, SectionHeading, Capsule } from "@/components/ui/primitives";
import { buttonClass } from "@/components/ui/button";
import { SERVICES, COMPANY, PARTNERSHIP, WHY_CHOOSE } from "@/lib/content";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Hospitality Services — Recruitment, Training, Operations",
  description:
    "Innspireo is a 360° hospitality solutions provider in Kochi: recruitment, HR consultancy, training, new project launches, turnaround, branding, management and catering.",
  alternates: { canonical: "/services" },
};

const ICONS: Record<string, React.ReactNode> = {
  recruitment: <Users />,
  "hr-consultancy": <ShieldCheck />,
  training: <GraduationCap />,
  "new-projects": <Rocket />,
  turnaround: <TrendingUp />,
  branding: <Megaphone />,
  management: <Building2 />,
  "star-rating": <Star />,
  events: <PartyPopper />,
};

export default function ServicesPage() {
  return (
    <>
      {/* Header */}
      <section className="bg-navy-panel">
        <div className="container-page py-14 sm:py-20">
          <div className="max-w-3xl">
            <Capsule inverse className="w-fit">
              Our services
            </Capsule>
            <h1 className="mt-7 font-display text-4xl font-bold leading-[1.05] text-white text-balance-tight sm:text-5xl lg:text-[3.25rem]">
              {COMPANY.headline}
            </h1>
            <p className="mt-6 text-base leading-relaxed text-white/80 sm:text-lg">
              {COMPANY.intro}
            </p>
          </div>
        </div>
      </section>

      {/* Services listing + explanation cards */}
      <Section>
        <SectionHeading
          eyebrow="Our core services"
          title="Designed to transform your hospitality business"
          description="Nine service lines covering the full life of a hospitality property — from the first feasibility study to the team that runs it."
        />

        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((service, i) => (
            <article
              key={service.slug}
              className="group flex flex-col border border-line bg-surface p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-lift"
            >
              <div className="flex items-start justify-between gap-4">
                <span className="grid size-11 shrink-0 place-items-center bg-brand-900 text-white [&_svg]:size-5">
                  {ICONS[service.slug]}
                </span>
                <span className="font-display text-2xl font-bold text-ink-200">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>

              <h2 className="mt-5 text-lg text-content">{service.title}</h2>
              <p className="mt-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-brand-600">
                {service.tagline}
              </p>
              <p className="mt-3.5 flex-1 text-sm leading-relaxed text-content-muted">
                {service.body}
              </p>

              <ul className="mt-5 space-y-2 border-t border-line pt-4">
                {service.points.map((point) => (
                  <li
                    key={point}
                    className="flex items-start gap-2.5 text-sm text-content-muted"
                  >
                    <Check className="mt-0.5 size-3.5 shrink-0 text-brand-600" />
                    {point}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </Section>

      {/* Partner with Innspireo */}
      <section className="bg-navy-panel">
        <div className="container-page py-14 sm:py-16 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-brand-200">
                <span aria-hidden className="size-1.5 bg-brand-200" />
                {PARTNERSHIP.eyebrow}
              </span>
              <h2 className="mt-5 font-display text-3xl font-bold leading-[1.08] text-white text-balance-tight sm:text-4xl">
                {PARTNERSHIP.title}
              </h2>
            </div>
            <div>
              <p className="text-base leading-relaxed text-white/80">
                {PARTNERSHIP.body}
              </p>
              <p className="mt-5 border-l-2 border-brand-200 pl-5 text-base leading-relaxed text-white">
                {PARTNERSHIP.closing}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/hire-with-us" className={buttonClass("white", "lg")}>
                  Find right staff
                  <ArrowRight />
                </Link>
                <a href={`tel:${SITE.phoneHref}`} className={buttonClass("inverse", "lg")}>
                  {SITE.phone}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why choose us */}
      <Section tone="muted">
        <SectionHeading
          eyebrow="Why choose Innspireo"
          title="One trusted partner, not a list of vendors"
          description="Full-spectrum hospitality solutions — from recruiting top talent and training teams, right through to branding, operations and profit growth."
          align="center"
        />

        <div className="mt-10 grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {WHY_CHOOSE.map((reason, i) => (
            <div key={reason.title} className="bg-surface p-6">
              <span className="font-display text-2xl font-bold text-ink-200">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-3 text-base text-content">{reason.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-content-muted">
                {reason.body}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/hire-with-us" className={buttonClass("primary", "lg")}>
            Start a brief
            <ArrowRight />
          </Link>
          <Link href="/contact" className={buttonClass("outline", "lg")}>
            Talk to our team
          </Link>
        </div>
      </Section>
    </>
  );
}
