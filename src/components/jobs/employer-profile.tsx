import Image from "next/image";
import Link from "next/link";
import {
  Building2,
  MapPin,
  Users,
  CalendarDays,
  Globe,
  Check,
  ShieldCheck,
} from "lucide-react";
import { Card, Badge, Divider } from "@/components/ui/primitives";
import { SITE } from "@/lib/constants";
import { resolveEmployer, inferEmployerFacts } from "@/lib/employers";
import { toLines } from "@/lib/format";
import type { Job } from "@/lib/types";

/**
 * "About the employer" on a job page.
 *
 * Two modes. When the client has agreed to be named, the full profile renders.
 * Until then it reports what the job text actually says about the employer —
 * property type, market, department, what the package covers — which is real
 * information rather than a placeholder.
 *
 * Neither mode shows a phone number, an email address or a contact name.
 * Candidates never approach a client directly; every contact runs through the
 * Innspireo team. `EmployerProfile` has no such fields for that reason.
 */
export function EmployerProfile({ job }: { job: Job }) {
  const employer = resolveEmployer(job);

  if (employer) {
    const paragraphs = toLines(employer.about).filter(Boolean);

    return (
      <section aria-labelledby="employer-heading">
        <div className="flex flex-wrap items-start gap-4">
          {employer.logo ? (
            <span className="relative size-16 shrink-0 overflow-hidden border border-line bg-surface">
              <Image
                src={employer.logo}
                alt=""
                fill
                sizes="64px"
                className="object-contain p-2"
              />
            </span>
          ) : (
            <span
              aria-hidden
              className="grid size-16 shrink-0 place-items-center border border-line bg-brand-50 text-brand-600"
            >
              <Building2 className="size-6" />
            </span>
          )}

          <div className="min-w-0 flex-1">
            <h2 id="employer-heading" className="text-2xl text-content">
              {employer.name}
            </h2>
            {employer.tagline ? (
              <p className="mt-1 text-sm text-content-muted">{employer.tagline}</p>
            ) : null}
          </div>
        </div>

        {paragraphs.length > 0 ? (
          <div className="mt-5 space-y-3">
            {paragraphs.map((paragraph, index) => (
              <p key={index} className="text-base leading-relaxed text-content-muted">
                {paragraph}
              </p>
            ))}
          </div>
        ) : null}

        {(employer.propertyType || employer.scale || employer.locations?.length || employer.founded) ? (
          <dl className="mt-6 grid gap-x-6 gap-y-4 sm:grid-cols-2">
            {employer.propertyType ? (
              <Fact icon={<Building2 />} label="Type" value={employer.propertyType} />
            ) : null}
            {employer.scale ? (
              <Fact icon={<Users />} label="Scale" value={employer.scale} />
            ) : null}
            {employer.locations?.length ? (
              <Fact
                icon={<MapPin />}
                label={employer.locations.length > 1 ? "Locations" : "Location"}
                value={employer.locations.join(" · ")}
              />
            ) : null}
            {employer.founded ? (
              <Fact icon={<CalendarDays />} label="Established" value={employer.founded} />
            ) : null}
          </dl>
        ) : null}

        {employer.highlights?.length ? (
          <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
            {employer.highlights.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-content-muted">
                <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-brand-600" />
                {item}
              </li>
            ))}
          </ul>
        ) : null}

        {employer.website ? (
          <p className="mt-6">
            <a
              href={employer.website}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 hover:underline"
            >
              <Globe className="size-4" />
              Visit their website
            </a>
          </p>
        ) : null}

        <ContactNote />
      </section>
    );
  }

  // --- Not named yet ----------------------------------------------------
  const facts = inferEmployerFacts(job);

  return (
    <section aria-labelledby="employer-heading">
      <h2 id="employer-heading" className="text-2xl text-content">
        About the employer
      </h2>

      {facts.known ? (
        <>
          <p className="mt-4 text-base leading-relaxed text-content-muted">
            Here is what we can tell you about the business hiring for this role before
            you apply.
          </p>

          <dl className="mt-5 grid gap-x-6 gap-y-4 sm:grid-cols-2">
            {facts.propertyType ? (
              <Fact icon={<Building2 />} label="Type of business" value={facts.propertyType} />
            ) : null}
            {facts.market ? (
              <Fact icon={<MapPin />} label="Market" value={facts.market} />
            ) : null}
            {facts.department ? (
              <Fact icon={<Users />} label="Department" value={facts.department} />
            ) : null}
          </dl>

          {facts.provided.length > 0 ? (
            <div className="mt-5">
              <p className="text-sm font-medium text-content">The employer provides</p>
              <ul className="mt-2.5 flex flex-wrap gap-2">
                {facts.provided.map((item) => (
                  <li key={item}>
                    <Badge tone="brand">
                      <Check />
                      {item}
                    </Badge>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </>
      ) : (
        <p className="mt-4 text-base leading-relaxed text-content-muted">
          This vacancy is being filled on behalf of a client business in the hospitality
          sector.
        </p>
      )}

      <Card className="mt-6 bg-surface-muted p-5">
        <p className="inline-flex items-center gap-2 text-sm font-semibold text-content">
          <ShieldCheck className="size-4 text-brand-600" />
          Why the name is not shown yet
        </p>
        <p className="mt-2.5 text-sm leading-relaxed text-content-muted">
          {SITE.name} recruits on behalf of client employers and does not publish their
          names on open listings — standard practice in overseas placement, and it
          protects the client&apos;s hiring plans. The employer, the property and the
          full package are disclosed to you during shortlisting, before any interview.
        </p>
        <Divider className="my-4" />
        <p className="text-sm text-content-muted">
          Questions about the employer before then?{" "}
          <Link
            href="/contact"
            className="font-semibold text-brand-700 underline underline-offset-2"
          >
            Ask our team
          </Link>{" "}
          — we will tell you what the client has agreed we can share.
        </p>
      </Card>

      <ContactNote />
    </section>
  );
}

/**
 * States plainly that the employer is not contacted directly. Shown in both
 * modes, because a named employer is the case where someone is most likely to
 * go looking for a phone number.
 */
function ContactNote() {
  return (
    <p className="mt-5 border-l-2 border-brand-900 bg-surface-muted py-3 pl-4 pr-3 text-sm leading-relaxed text-content-muted">
      <strong className="font-semibold text-content">
        Please do not contact the employer directly.
      </strong>{" "}
      Applications and all follow-up run through the {SITE.name} team — approaching a
      client outside the process does not speed anything up, and can take you out of
      consideration.
    </p>
  );
}

function Fact({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span
        aria-hidden
        className="grid size-9 shrink-0 place-items-center bg-brand-50 text-brand-600 [&_svg]:size-4"
      >
        {icon}
      </span>
      <span className="min-w-0">
        <dt className="text-xs uppercase tracking-wider text-content-subtle">{label}</dt>
        <dd className="mt-0.5 text-sm font-medium text-content">{value}</dd>
      </span>
    </div>
  );
}
