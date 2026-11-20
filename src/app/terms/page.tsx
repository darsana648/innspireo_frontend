import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "The terms that apply to using the Innspireo Careers site and applying for roles.",
  alternates: { canonical: "/terms" },
};

const UPDATED = "19 November 2026";

export default function LegalPage() {
  return (
    <>
      <section className="border-b border-line bg-surface-muted">
        <div className="container-page py-12 sm:py-16">
          <h1 className="text-3xl text-content sm:text-4xl">Terms of use</h1>
          <p className="mt-3 text-sm text-content-subtle">Last updated: {UPDATED}</p>
        </div>
      </section>

      <div className="container-page py-12 sm:py-16">
        <div className="max-w-3xl space-y-8">
          <section>
            <h2 className="text-xl text-content sm:text-2xl">About these terms</h2>
            <p className="mt-3 text-sm leading-relaxed text-content-muted sm:text-base">
              These terms apply to your use of this website, which is operated by {SITE.legalName}. By using the site, creating a profile or submitting an application, you accept them.
            </p>
          </section>
          <section>
            <h2 className="text-xl text-content sm:text-2xl">What this site is</h2>
            <p className="mt-3 text-sm leading-relaxed text-content-muted sm:text-base">
              This site advertises vacancies that Innspireo is recruiting for on behalf of client employers. Innspireo is the recruitment agency; it is not the employer. If you are placed, your employment contract is with the client employer, not with us.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-content-muted sm:text-base">
              Employer identities are not published on open listings. The employer, property and full package are disclosed to shortlisted candidates before any interview.
            </p>
          </section>
          <section>
            <h2 className="text-xl text-content sm:text-2xl">Using the site</h2>
            <p className="mt-3 text-sm leading-relaxed text-content-muted sm:text-base">
              You agree to give accurate information in your profile and applications, and not to misrepresent your experience, qualifications or documents. We may decline or withdraw an application where information proves to be inaccurate.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-content-muted sm:text-base">
              You may not scrape, copy or republish listings from this site, or use it to send unsolicited commercial messages.
            </p>
          </section>
          <section>
            <h2 className="text-xl text-content sm:text-2xl">Vacancies and availability</h2>
            <p className="mt-3 text-sm leading-relaxed text-content-muted sm:text-base">
              Listings reflect client requirements at the time of posting. Salary ranges, benefits and start dates are indicative and are confirmed only in a written offer from the employer.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-content-muted sm:text-base">
              A vacancy may be withdrawn or filled at any time. Applying does not create any entitlement to an interview, an offer or employment.
            </p>
          </section>
          <section>
            <h2 className="text-xl text-content sm:text-2xl">No candidate fees</h2>
            <p className="mt-3 text-sm leading-relaxed text-content-muted sm:text-base">
              Innspireo does not charge candidates any registration, application or placement fee. Any demand for such a payment is not authorised by us and should be reported to us.
            </p>
          </section>
          <section>
            <h2 className="text-xl text-content sm:text-2xl">Third-party links</h2>
            <p className="mt-3 text-sm leading-relaxed text-content-muted sm:text-base">
              Where we link to other sites, including our main company site and our published articles, we are not responsible for their content.
            </p>
          </section>
          <section>
            <h2 className="text-xl text-content sm:text-2xl">Liability</h2>
            <p className="mt-3 text-sm leading-relaxed text-content-muted sm:text-base">
              We provide this site in good faith but do not warrant that listings are error-free or continuously available. To the extent permitted by law, we are not liable for indirect or consequential loss arising from use of the site.
            </p>
          </section>
          <section>
            <h2 className="text-xl text-content sm:text-2xl">Governing law</h2>
            <p className="mt-3 text-sm leading-relaxed text-content-muted sm:text-base">
              These terms are governed by the laws of India, and the courts at Kochi, Kerala have jurisdiction over any dispute.
            </p>
          </section>
          <div className="rounded-none border border-line bg-surface-muted p-6">
            <h2 className="text-lg text-content">Questions about this policy?</h2>
            <p className="mt-2 text-sm leading-relaxed text-content-muted">
              Write to{""}
              <a
                href={`mailto:${SITE.email}`}
                className="font-semibold text-brand-600 underline underline-offset-2"
              >
                {SITE.email}
              </a>{""}
              or use our{""}
              <Link
                href="/contact"
                className="font-semibold text-brand-600 underline underline-offset-2"
              >
                contact form
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
