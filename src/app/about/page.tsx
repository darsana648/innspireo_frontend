import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Target,
  Compass,
  MapPin,
  Quote,
  Check,
  Users,
  ShieldCheck,
  Mail,
  Phone,
} from "lucide-react";
import { getFacets } from "@/lib/api";
import { Section, SectionHeading, Capsule } from "@/components/ui/primitives";
import { buttonClass } from "@/components/ui/button";
import { SITE, jobsUrl } from "@/lib/constants";
import { COMPANY, TEAM, ABOUT_COPY, KEY_SERVICES } from "@/lib/content";

export const metadata: Metadata = {
  title: "About Innspireo",
  description:
    "Innspireo Hospitality Management LLP is a 360° hospitality solutions provider in Kochi, Kerala, with nearly three decades of experience across recruitment, training and hotel operations.",
  alternates: { canonical: "/about" },
};

export const revalidate = 3600;

export default async function AboutPage() {
  const facets = await getFacets();

  return (
    <>
      {/* About */}
      <section className="bg-navy-panel">
        <div className="container-page py-14 sm:py-20">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-start lg:gap-16">
            <div>
              <Capsule inverse className="w-fit">
                About us
              </Capsule>
              <h1 className="mt-7 font-display text-4xl font-bold leading-[1.05] text-white text-balance-tight sm:text-5xl">
                Your trusted partners in hospitality excellence
              </h1>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg">
                {COMPANY.intro}
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link href="/services" className={buttonClass("white", "lg")}>
                  Our services
                  <ArrowRight />
                </Link>
                <Link href="/contact" className={buttonClass("inverse", "lg")}>
                  Talk to our team
                </Link>
              </div>
            </div>

            {/* At-a-glance panel — the right half was empty navy otherwise. */}
            <dl className="border border-white/12">
              {[
                { k: "Headquarters", v: "Kochi, Kerala, India" },
                { k: "Experience", v: `${COMPANY.yearsExperience} in hospitality` },
                { k: "Placement markets", v: "India, the Gulf and Europe" },
                { k: "We work with", v: "Hotels, restaurants, cafés, catering" },
                { k: "Candidate fees", v: "None, at any stage" },
              ].map((row) => (
                <div
                  key={row.k}
                  className="flex flex-col gap-1 border-b border-white/12 px-5 py-4 last:border-b-0 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
                >
                  <dt className="text-xs uppercase tracking-[0.12em] text-white/65">
                    {row.k}
                  </dt>
                  <dd className="text-sm font-medium text-white sm:text-right">{row.v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <dl className="mt-14 grid grid-cols-2 border-t border-white/12 lg:grid-cols-4">
            {[
              { v: COMPANY.yearsExperience, k: "Industry experience" },
              { v: COMPANY.placements, k: "Placements made" },
              { v: COMPANY.countries, k: "Countries" },
              { v: String(facets.total), k: "Live vacancies" },
            ].map((s, i) => (
              <div
                key={s.k}
                className={[
                  "border-white/12 px-1 py-7 sm:px-4",
                  i % 2 === 0 ? "border-r" : "",
                  i < 2 ? "border-b" : "",
                  "lg:border-b-0",
                  i === 3 ? "lg:border-r-0" : "lg:border-r",
                ].join(" ")}
              >
                <dd className="font-display text-2xl font-bold text-white sm:text-3xl">
                  {s.v}
                </dd>
                <dt className="mt-2 text-xs uppercase tracking-[0.12em] text-white/65">
                  {s.k}
                </dt>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Who we are */}
      <Section>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <SectionHeading eyebrow="Who we are" title="More than consultants" />
          <div className="space-y-4 text-base leading-relaxed text-content-muted">
            <p>{ABOUT_COPY.whoWeAre}</p>
            <p>
              Our integrated platform means clients reach every service under one roof,
              rather than coordinating a different vendor for each problem. We also run
              our own branded chain of hotels, restaurants and signature cafés — so the
              advice we give operators is advice we take ourselves.
            </p>
          </div>
        </div>
      </Section>

      {/* Key services & reasons */}
      <Section tone="muted">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <div>
            <SectionHeading eyebrow="What we do" title="Key services & reasons" />
            <p className="mt-5 text-base leading-relaxed text-content-muted">
              {ABOUT_COPY.keyServicesIntro}
            </p>
            <Link href="/services" className={buttonClass("outline", "md", "mt-7")}>
              Service details
              <ArrowRight />
            </Link>
          </div>

          <ul className="grid grid-cols-1 gap-px self-start border border-line bg-line sm:grid-cols-2">
            {KEY_SERVICES.map((service) => (
              <li
                key={service}
                className="flex items-start gap-3 bg-surface px-5 py-4 text-sm font-medium text-content"
              >
                <Check className="mt-0.5 size-4 shrink-0 text-brand-600" />
                {service}
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* Mission */}
      <section className="bg-navy-panel">
        <div className="container-page py-14 sm:py-20">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-brand-200">
                <Target className="size-4" />
                Our mission
              </span>
              <Quote aria-hidden className="mt-6 size-10 text-white/20" />
            </div>
            <div>
              <p className="font-display text-2xl font-bold leading-snug text-white text-balance-tight sm:text-3xl">
                {COMPANY.missionTitle}
              </p>
              <p className="mt-6 text-base leading-relaxed text-white/80">
                {COMPANY.missionBody}
              </p>
              <p className="mt-5 border-l-2 border-brand-200 pl-5 text-base leading-relaxed text-white/80">
                {COMPANY.missionProof}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Vision */}
      <Section>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div>
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">
              <Compass className="size-4" />
              Our vision
            </span>
          </div>
          <div>
            <p className="font-display text-2xl font-bold leading-snug text-content text-balance-tight sm:text-3xl">
              {COMPANY.visionTitle}
            </p>
            <p className="mt-6 text-base leading-relaxed text-content-muted">
              {COMPANY.visionBody}
            </p>
          </div>
        </div>
      </Section>

      {/* Our team */}
      <Section tone="muted">
        <SectionHeading
          eyebrow="Our team"
          title="Led by hospitality operators"
          description="Innspireo is founded and led by experienced hospitality professionals with expertise across hotels, restaurants, catering, recruitment and training."
        />

        {/* One wide card: portrait beside the bio, rather than a narrow
            column next to a half-empty one. */}
        <div className="mt-10 border border-line bg-surface">
          {TEAM.map((member) => (
            <article key={member.name} className="grid grid-cols-1 md:grid-cols-[18rem_1fr] lg:grid-cols-[22rem_1fr]">
              {/* Portrait slot. Swap TEAM[].photo for the real headshot — the
                  current file is a branded placeholder, not a likeness. */}
              <div className="relative aspect-[4/5] w-full overflow-hidden border-b border-line bg-brand-900 md:aspect-auto md:border-b-0 md:border-r">
                <Image
                  src={member.photo}
                  alt={`${member.name}, ${member.role}`}
                  fill
                  sizes="(min-width: 1024px) 22rem, (min-width: 768px) 18rem, 100vw"
                  className="object-cover object-center"
                />
              </div>

              <div className="flex flex-col p-7 sm:p-9">
                <p className="font-display text-2xl font-bold text-content sm:text-3xl">
                  {member.name}
                </p>
                <p className="mt-2 text-sm font-semibold text-brand-600">{member.role}</p>
                <p className="mt-5 border-t border-line pt-5 text-base leading-relaxed text-content-muted">
                  {member.bio}
                </p>

                <div className="mt-6 flex flex-wrap gap-x-7 gap-y-2.5 text-sm">
                  <a
                    href={`mailto:${SITE.email}`}
                    className="-my-1.5 inline-flex min-h-11 items-center gap-2 py-1.5 font-medium text-brand-600 hover:underline"
                  >
                    <Mail className="size-4 shrink-0" />
                    <span className="break-all">{SITE.email}</span>
                  </a>
                  <a
                    href={`tel:${SITE.phoneHref}`}
                    className="-my-1.5 inline-flex min-h-11 items-center gap-2 py-1.5 font-medium text-brand-600 hover:underline"
                  >
                    <Phone className="size-4 shrink-0" />
                    {SITE.phone}
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* How we work, as three principles rather than one paragraph in a
            box that ran out of content halfway down. */}
        <div className="mt-4 grid grid-cols-1 gap-px border border-line bg-line md:grid-cols-3">
          {[
            {
              icon: <Users />,
              title: "People and performance",
              body: "Practical, results-driven solutions delivered on the floor — not strategy decks handed over at the end of an engagement.",
            },
            {
              icon: <Target />,
              title: "Scoped to an outcome",
              body: "Every engagement is measured against a number that has to move. If it does not move, the work has not landed.",
            },
            {
              icon: <ShieldCheck />,
              title: "We turn work down",
              body: "We would rather decline work we cannot deliver than add another logo to a client list and under-serve it.",
            },
          ].map((item) => (
            <div key={item.title} className="bg-surface p-6 sm:p-7">
              <span className="grid size-11 place-items-center bg-brand-900 text-white [&_svg]:size-5">
                {item.icon}
              </span>
              <h3 className="mt-5 text-base text-content">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-content-muted">{item.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-col items-start justify-between gap-5 border-t border-line pt-6 sm:flex-row sm:items-center">
          <p className="flex items-start gap-2.5 text-sm text-content-muted">
            <MapPin className="mt-0.5 size-4 shrink-0 text-brand-600" />
            {SITE.address}
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/contact" className={buttonClass("primary", "md")}>
              Contact our team
              <ArrowRight />
            </Link>
            <Link href={jobsUrl("/jobs")} className={buttonClass("outline", "md")}>
              Browse {facets.total} open roles
            </Link>
          </div>
        </div>
      </Section>
    </>
  );
}
