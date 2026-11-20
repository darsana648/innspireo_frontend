import type { Metadata } from "next";
import Link from "next/link";
import {
  Users,
  ClipboardList,
  PlaneTakeoff,
  ShieldCheck,
  Clock,
  Globe2,
  ChefHat,
  ArrowRight,
} from "lucide-react";
import { getFacets } from "@/lib/api";
import { EnquiryForm } from "@/components/forms/enquiry-form";
import { Capsule, Card, Section, SectionHeading } from "@/components/ui/primitives";
import { buttonClass } from "@/components/ui/button";
import { SITE, CATEGORIES, DESTINATIONS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Hire Hospitality Staff — Recruitment for Hotels & Catering",
  description:
    "Innspireo recruits, screens and mobilises hotel, kitchen and F&B talent for employers across the Gulf and Europe. Send a hiring brief and receive a shortlist.",
  alternates: { canonical: "/hire-with-us" },
};

export const revalidate = 3600;

const SERVICES = [
  {
    icon: <ClipboardList />,
    title: "Brief to shortlist",
    body: "You send the role, package and start date. We return screened candidates with CVs, trade-test notes and availability — not a database dump.",
  },
  {
    icon: <Users />,
    title: "Volume and pre-opening",
    body: "From a single chef de partie to a full brigade for a new property, mobilised in planned waves against your opening calendar.",
  },
  {
    icon: <PlaneTakeoff />,
    title: "Documentation and mobilisation",
    body: "Attestation, medicals, visa processing and travel coordinated through to arrival, so your start dates actually hold.",
  },
  {
    icon: <ShieldCheck />,
    title: "Ethical recruitment",
    body: "We never charge candidates a placement fee. That keeps your hires motivated, compliant and far less likely to abscond.",
  },
];

export default async function HireWithUsPage() {
  const facets = await getFacets();

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-navy-panel">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 -top-32 size-[32rem] rounded-none bg-white/5 blur-3xl"
        />
        <div className="container-page relative py-14 sm:py-20">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <Capsule inverse className="w-fit">
                For employers
              </Capsule>
              <h1 className="mt-7 font-display text-4xl font-bold leading-[1.05] text-white text-balance-tight sm:text-5xl lg:text-[3.25rem]">
                Hospitality hiring, handled end to end
              </h1>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg">
                {SITE.legalName} recruits kitchen, F&amp;B, front office and housekeeping
                talent for hotels, resorts and catering groups. You brief us once — we
                screen, shortlist, document and mobilise.
              </p>

              <ul className="mt-8 space-y-3">
                {[
                  "Shortlists built against your brief, not a CV database",
                  "Candidates never charged a fee — ethical and compliant",
                  "Visa, attestation and travel managed to your start date",
                ].map((point) => (
                  <li key={point} className="flex items-start gap-2.5 text-sm text-white/80">
                    <ShieldCheck className="mt-0.5 size-4 shrink-0 text-brand-300" />
                    {point}
                  </li>
                ))}
              </ul>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link href="#brief" className={buttonClass("white", "lg")}>
                  Send a hiring brief
                  <ArrowRight />
                </Link>
                <a href={`tel:${SITE.phoneHref}`} className={buttonClass("inverse", "lg")}>
                  Call {SITE.phone}
                </a>
              </div>
            </div>

            {/* Capability panel */}
            <dl className="grid grid-cols-2 gap-4">
              <Panel
                icon={<ChefHat />}
                label="Departments covered"
                value={String(CATEGORIES.length)}
                note="Kitchen to security"
              />
              <Panel
                icon={<Globe2 />}
                label="Placement markets"
                value={String(DESTINATIONS.length)}
                note="Gulf and Europe"
              />
              <Panel
                icon={<Users />}
                label="Live mandates"
                value={String(facets.total)}
                note="Roles open now"
              />
              <Panel
                icon={<Clock />}
                label="First response"
                value="1 day"
                note="Working days"
              />
            </dl>
          </div>
        </div>
      </section>

      {/* Services */}
      <Section>
        <SectionHeading
          eyebrow="What we do"
          title="A recruitment partner, not a job board"
          description="We are a managed service. Every candidate you see has been screened by our team against your brief."
          align="center"
        />
        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {SERVICES.map((s) => (
            <Card key={s.title} className="flex gap-4 p-6">
              <span className="grid size-11 shrink-0 place-items-center rounded-none bg-brand-50 text-brand-600 [&_svg]:size-5">
                {s.icon}
              </span>
              <div>
                <h3 className="text-base text-content">{s.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-content-muted">{s.body}</p>
              </div>
            </Card>
          ))}
        </div>
      </Section>

      {/* Departments we recruit for */}
      <Section muted>
        <SectionHeading
          eyebrow="Coverage"
          title="Departments we recruit for"
          description="Hospitality-only. We do not cover unrelated sectors, which is why our shortlists land."
        />
        <ul className="mt-10 flex flex-wrap gap-2.5">
          {CATEGORIES.map((c) => (
            <li key={c.id}>
              <span className="inline-flex items-center rounded-none border border-line-strong bg-surface px-4 py-2 text-sm text-content-muted">
                {c.name}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {DESTINATIONS.map((d) => (
            <div
              key={d.slug}
              className="rounded-none border border-line bg-surface-raised p-5 shadow-soft"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-600">
                {d.region}
              </p>
              <h3 className="mt-1.5 text-base text-content">{d.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-content-muted">{d.blurb}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* The brief form */}
      <Section id="brief">
        <div className="grid gap-12 lg:grid-cols-[1fr_22rem]">
          <div className="min-w-0">
            <SectionHeading
              eyebrow="Start here"
              title="Send us a hiring brief"
              description="Give us the roles, the market and your timeline. We will come back with next steps and an indicative shortlist window."
            />
            <div className="mt-8">
              <EnquiryForm mode="employer" />
            </div>
          </div>

          <aside className="space-y-5">
            <Card className="p-6">
              <h3 className="text-base text-content">Prefer to talk first?</h3>
              <p className="mt-2 text-sm leading-relaxed text-content-muted">
                Call or email our recruitment desk directly — we are based in Kochi, India
                and work Gulf and European hours.
              </p>
              <div className="mt-5 space-y-3 text-sm">
                <a
                  href={`tel:${SITE.phoneHref}`}
                  className="block font-medium text-brand-600 hover:underline"
                >
                  {SITE.phone}
                </a>
                <a
                  href={`mailto:${SITE.email}`}
                  className="block break-all font-medium text-brand-600 hover:underline"
                >
                  {SITE.email}
                </a>
                <p className="text-content-subtle">{SITE.address}</p>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-base text-content">What we will ask</h3>
              <ul className="mt-3 space-y-2.5 text-sm text-content-muted">
                {[
                  "Role titles and how many of each",
                  "Property type and cuisine or service style",
                  "Salary, accommodation, food and leave terms",
                  "Target start date and visa route",
                  "Interview format — video, trade test or in person",
                ].map((item) => (
                  <li key={item} className="flex gap-2.5">
                    <span
                      aria-hidden
                      className="mt-1.5 size-1.5 shrink-0 rounded-none bg-brand-900"
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-6">
              <h3 className="text-base text-content">Looking for a job instead?</h3>
              <p className="mt-2 text-sm leading-relaxed text-content-muted">
                This page is for employers. Candidates should browse live vacancies and
                apply directly.
              </p>
              <Link href="/jobs" className={buttonClass("outline", "sm", "mt-4 w-full")}>
                Browse {facets.total} open roles
                <ArrowRight />
              </Link>
            </Card>
          </aside>
        </div>
      </Section>
    </>
  );
}

function Panel({
  icon,
  label,
  value,
  note,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="rounded-none border border-white/12 bg-white/5 p-5 backdrop-blur-sm">
      <dt className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-white/55">
        <span className="text-brand-300 [&_svg]:size-4">{icon}</span>
        {label}
      </dt>
      <dd className="mt-2 font-display text-3xl font-bold text-white">{value}</dd>
      <p className="mt-1 text-xs text-white/50">{note}</p>
    </div>
  );
}
