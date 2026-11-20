import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
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
  MessageCircle,
  Mail,
  Phone,
} from "lucide-react";
import { Section, SectionHeading } from "@/components/ui/primitives";
import { Accordion } from "@/components/ui/accordion";
import { buttonClass } from "@/components/ui/button";
import { DESTINATIONS, SITE } from "@/lib/constants";
import { SERVICES, COMPANY, FAQS } from "@/lib/content";
import type { Facets } from "@/lib/api";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/* Stats bar — dense factual band straight under the hero                      */
/* -------------------------------------------------------------------------- */

export function StatsBar({ facets }: { facets: Facets }) {
  const stats = [
    { value: COMPANY.yearsExperience, label: "Industry experience", note: "Hospitality only" },
    { value: COMPANY.placements, label: "Placements made", note: "Candidates placed to date" },
    { value: COMPANY.countries, label: "Countries", note: "Global reach" },
    { value: String(facets.total), label: "Live vacancies", note: "Open right now" },
  ];

  return (
    /* A hairline keeps this from merging into the hero's own dark scrim. */
    <section className="border-t border-white/10 bg-navy-panel">
      <div className="container-page">
        <dl className="grid grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className={cn(
                "border-white/12 px-5 py-8 sm:px-6 sm:py-10",
                i % 2 === 0 && "border-r",
                i < 2 && "border-b",
                "lg:border-b-0",
                i === stats.length - 1 ? "lg:border-r-0" : "lg:border-r",
              )}
            >
              <dd className="font-display text-3xl font-bold leading-none text-white sm:text-4xl">
                {stat.value}
              </dd>
              <dt className="mt-3.5 text-sm font-semibold text-white">{stat.label}</dt>
              <p className="mt-1 text-xs text-white/65">{stat.note}</p>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* About preview                                                               */
/* -------------------------------------------------------------------------- */

export function AboutPreview() {
  return (
    <Section>
      <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        <SectionHeading eyebrow="About Innspireo" title="More than consultants" />
        <div className="space-y-4 text-base leading-relaxed text-content-muted">
          <p>{COMPANY.intro}</p>
          <p>
            Our integrated platform means clients reach every service under one roof,
            rather than coordinating a different vendor for each problem. We also run our
            own branded chain of hotels, restaurants and cafés — so the advice we give
            operators is advice we take ourselves.
          </p>
          <p className="border-l-2 border-brand-200 pl-5 font-medium text-content">
            {COMPANY.missionTitle}
          </p>
          <Link
            href="/about"
            className="inline-flex items-center gap-1.5 pt-1 text-sm font-semibold text-brand-600 hover:underline"
          >
            Read our story
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </Section>
  );
}

/* -------------------------------------------------------------------------- */
/* Services preview                                                            */
/* -------------------------------------------------------------------------- */

const SERVICE_ICONS: Record<string, React.ReactNode> = {
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

export function ServicesPreview() {
  return (
    <Section tone="muted">
      <SectionHeading
        eyebrow="What we offer"
        title="All-in-one hospitality management services"
        description="Nine service lines covering the full life of a hospitality property — from the first feasibility study to the team that runs it."
        action={
          <Link href="/services" className={buttonClass("outline", "md")}>
            All services
            <ArrowRight />
          </Link>
        }
      />

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SERVICES.map((service) => (
          <Link
            key={service.slug}
            href="/services"
            className="group flex flex-col border border-line bg-surface p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-lift"
          >
            <span className="grid size-11 shrink-0 place-items-center bg-brand-900 text-white [&_svg]:size-5">
              {SERVICE_ICONS[service.slug]}
            </span>
            <h3 className="mt-5 text-base text-content">{service.title}</h3>
            <p className="mt-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-brand-600">
              {service.tagline}
            </p>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-content-muted">
              {service.body}
            </p>
            <span className="mt-5 flex items-center justify-between border-t border-line pt-4 text-sm font-medium text-brand-600">
              Learn more
              <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
      </div>
    </Section>
  );
}

/* -------------------------------------------------------------------------- */
/* Discover the Perfect Talent — the employer pitch, in the company's words    */
/* -------------------------------------------------------------------------- */

export function TalentSection() {
  const highlights = [
    "Permanent staff placements, not temporary cover",
    "Top-tier talent sourced from across India",
    "Screened and trade-tested before they reach your interview",
    "Visa, documentation and mobilisation handled end to end",
  ];

  return (
    <section className="bg-navy-panel">
      <div className="container-page py-14 sm:py-16 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-brand-200">
              <span aria-hidden className="size-1.5 bg-brand-200" />
              Discover the perfect talent
            </span>
            <h2 className="mt-5 font-display text-3xl font-bold leading-[1.08] text-white text-balance-tight sm:text-4xl">
              Your global partner in hospitality &amp; catering recruitment
            </h2>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-white/80">
              We specialise in permanent staff placements, connecting you with top-tier
              talent from India to fulfil your global needs. Whether you are looking for
              hospitality staff, skilled chefs or expert cooks, we provide fast, reliable
              and customised recruitment solutions, tailored to drive your success.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/hire-with-us" className={buttonClass("white", "lg")}>
                Find right staff
                <ArrowRight />
              </Link>
              <a href={`tel:${SITE.phoneHref}`} className={buttonClass("inverse", "lg")}>
                {SITE.phone}
              </a>
            </div>
          </div>

          <ul className="space-y-px border border-white/12">
            {highlights.map((point) => (
              <li
                key={point}
                className="flex items-start gap-3.5 border-b border-white/12 px-5 py-5 last:border-b-0"
              >
                <Check className="mt-0.5 size-4 shrink-0 text-brand-200" />
                <span className="text-sm leading-relaxed text-white/85">{point}</span>
              </li>
            ))}
            <li className="px-5 py-5">
              <p className="text-xs uppercase tracking-[0.12em] text-white/55">
                Placing into
              </p>
              <p className="mt-2 text-sm text-white/85">
                {DESTINATIONS.map((d) => d.name).join(" · ")}
              </p>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* FAQ preview                                                                 */
/* -------------------------------------------------------------------------- */

export function FaqPreview() {
  const items = FAQS.slice(0, 6).map((f) => ({ question: f.question, answer: f.answer }));

  // How many questions sit in each group, so the left column carries real
  // information instead of a heading and a lot of empty space.
  const groups = Array.from(
    FAQS.reduce((acc, f) => acc.set(f.group, (acc.get(f.group) ?? 0) + 1), new Map<string, number>()),
  );

  return (
    <Section tone="muted">
      <div className="grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:gap-14">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <SectionHeading eyebrow="FAQ" title="Know more about Innspireo" />
          <p className="mt-5 text-base leading-relaxed text-content-muted">
            The questions we are asked most often, by candidates and operators alike.
          </p>

          <ul className="mt-7 border-y border-line">
            {groups.map(([group, count]) => (
              <li
                key={group}
                className="flex items-center justify-between gap-4 border-b border-line py-3 last:border-b-0"
              >
                <span className="text-sm font-medium text-content">{group}</span>
                <span className="text-sm tabular-nums text-content-subtle">
                  {count} {count === 1 ? "question" : "questions"}
                </span>
              </li>
            ))}
          </ul>

          <Link href="/faqs" className={buttonClass("outline", "md", "mt-7")}>
            All {FAQS.length} questions
            <ArrowRight />
          </Link>

          {/* Fills the column, and gives someone with an unanswered question
              somewhere to go without scrolling to the footer. */}
          <div className="mt-8 border border-line bg-surface p-6">
            <h3 className="inline-flex items-center gap-2 text-base text-content">
              <MessageCircle className="size-4 text-brand-600" />
              Still need an answer?
            </h3>
            <p className="mt-2.5 text-sm leading-relaxed text-content-muted">
              Our recruitment desk in Kochi answers candidate and employer questions
              directly, usually within one working day.
            </p>
            <div className="mt-5 space-y-2.5 border-t border-line pt-4 text-sm">
              <a
                href={`mailto:${SITE.email}`}
                className="flex items-center gap-2.5 font-medium text-brand-600 hover:underline"
              >
                <Mail className="size-4 shrink-0" />
                <span className="break-all">{SITE.email}</span>
              </a>
              <a
                href={`tel:${SITE.phoneHref}`}
                className="flex items-center gap-2.5 font-medium text-brand-600 hover:underline"
              >
                <Phone className="size-4 shrink-0" />
                {SITE.phone}
              </a>
            </div>
          </div>
        </div>

        <Accordion items={items} />
      </div>
    </Section>
  );
}

/* -------------------------------------------------------------------------- */
/* Backend-unavailable banner                                                  */
/* -------------------------------------------------------------------------- */

export function DegradedBanner() {
  return (
    <div className="border-b border-amber-300 bg-amber-50">
      <div className="container-page py-3">
        <p className="text-center text-sm text-amber-900">
          Live vacancies could not be loaded right now. Please refresh, or{" "}
          <Link href="/contact" className="font-semibold underline underline-offset-2">
            contact our team
          </Link>{" "}
          and we will send you current openings directly.
        </p>
      </div>
    </div>
  );
}
