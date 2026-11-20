import Link from "next/link";
import { Mail, MapPin, Phone, Linkedin, Facebook, ArrowUpRight } from "lucide-react";
import { SITE, CATEGORIES, jobsUrl } from "@/lib/constants";
import { SERVICES } from "@/lib/content";
import { Logo } from "./logo";

// These all live on the job board, which may be served from its own
// subdomain — jobsUrl() emits absolute URLs once that split happens.
const candidateLinks = [
  { label: "Browse all jobs", href: jobsUrl("/jobs") },
  { label: "Create your profile", href: jobsUrl("/register") },
  { label: "Sign in", href: jobsUrl("/login") },
  { label: "My applications", href: jobsUrl("/applications") },
  { label: "Saved jobs", href: jobsUrl("/saved-jobs") },
];

const companyLinks = [
  { label: "About Innspireo", href: "/about" },
  { label: "Our services", href: "/services" },
  { label: "Hire with us", href: "/hire-with-us" },
  { label: "Career insights", href: "/blogs" },
  { label: "FAQs", href: "/faqs" },
  { label: "Contact", href: "/contact" },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line bg-surface-muted">
      <div className="container-page py-14 sm:py-16">
        <div className="grid gap-12 lg:grid-cols-12">
          {/* Brand + contact */}
          <div className="lg:col-span-4">
            <Link href="/" aria-label="Innspireo Careers — home">
              <Logo />
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-content-muted">
              A hospitality recruitment practice placing chefs, F&amp;B, front office and
              housekeeping professionals with employers across the Gulf and Europe.
            </p>

            <ul className="mt-6 space-y-3 text-sm">
              <li>
                <a
                  href={`mailto:${SITE.email}`}
                  className="group flex items-start gap-3 text-content-muted transition-colors hover:text-brand-600"
                >
                  <Mail className="mt-0.5 size-4 shrink-0 text-brand-600" />
                  <span className="break-all">{SITE.email}</span>
                </a>
              </li>
              <li>
                <a
                  href={`tel:${SITE.phoneHref}`}
                  className="group flex items-start gap-3 text-content-muted transition-colors hover:text-brand-600"
                >
                  <Phone className="mt-0.5 size-4 shrink-0 text-brand-600" />
                  <span>{SITE.phone}</span>
                </a>
              </li>
              <li className="flex items-start gap-3 text-content-muted">
                <MapPin className="mt-0.5 size-4 shrink-0 text-brand-600" />
                <span>{SITE.address}</span>
              </li>
            </ul>

            <div className="mt-6 flex items-center gap-2">
              <a
                href={SITE.social.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Innspireo on LinkedIn"
                className="grid size-9 place-items-center rounded-none border border-line bg-surface text-content-muted transition-colors hover:border-brand-700 hover:text-brand-600"
              >
                <Linkedin className="size-4" />
              </a>
              <a
                href={SITE.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Innspireo on Facebook"
                className="grid size-9 place-items-center rounded-none border border-line bg-surface text-content-muted transition-colors hover:border-brand-700 hover:text-brand-600"
              >
                <Facebook className="size-4" />
              </a>
            </div>
          </div>

          {/* Link columns */}
          <div className="grid gap-10 sm:grid-cols-3 lg:col-span-8">
            <FooterColumn title="For candidates" links={candidateLinks} />
            <FooterColumn title="Company" links={companyLinks} />

            <div>
              <h3 className="text-sm font-semibold text-content">Services</h3>
              <ul className="mt-4 space-y-2.5">
                {SERVICES.slice(0, 6).map((service) => (
                  <li key={service.slug}>
                    <Link
                      href="/services"
                      className="text-sm text-content-muted transition-colors hover:text-brand-600"
                    >
                      {service.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Category rail for SEO depth */}
        <div className="mt-12 border-t border-line pt-8">
          <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-content-subtle">
            Browse by department
          </h3>
          <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2.5">
            {CATEGORIES.map((c) => (
              <li key={c.id}>
                <Link
                  href={jobsUrl(`/jobs?category=${c.id}`)}
                  className="text-sm text-content-muted transition-colors hover:text-brand-600"
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Legal bar */}
        <div className="mt-10 flex flex-col gap-4 border-t border-line pt-7 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs leading-relaxed text-content-subtle">
            &copy; {year} {SITE.legalName}. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
            <Link
              href="/privacy"
              className="text-content-subtle transition-colors hover:text-content"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-content-subtle transition-colors hover:text-content"
            >
              Terms
            </Link>
            <a
              href={SITE.parentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-content-subtle transition-colors hover:text-content"
            >
              innspireo.com
              <ArrowUpRight className="size-3" />
            </a>
          </div>
        </div>

        {/* Honest statement of how placement works — replaces the fake
 marketplace claims on the current site. */}
        <p className="mt-6 max-w-3xl text-xs leading-relaxed text-content-subtle">
          Innspireo is a recruitment and hospitality management firm. Roles listed here are
          placed by our team on behalf of client employers, whose identity is shared with
          candidates during shortlisting. We never charge candidates a fee to apply.
        </p>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-content">{title}</h3>
      <ul className="mt-4 space-y-2.5">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="text-sm text-content-muted transition-colors hover:text-brand-600"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
