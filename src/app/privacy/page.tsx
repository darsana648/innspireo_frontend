import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Innspireo collects, uses and protects candidate and employer information.",
  alternates: { canonical: "/privacy" },
};

const UPDATED = "19 November 2026";

export default function LegalPage() {
  return (
    <>
      <section className="border-b border-line bg-surface-muted">
        <div className="container-page py-12 sm:py-16">
          <h1 className="text-3xl text-content sm:text-4xl">Privacy policy</h1>
          <p className="mt-3 text-sm text-content-subtle">Last updated: {UPDATED}</p>
        </div>
      </section>

      <div className="container-page py-12 sm:py-16">
        <div className="max-w-3xl space-y-8">
          <section>
            <h2 className="text-xl text-content sm:text-2xl">Who we are</h2>
            <p className="mt-3 text-sm leading-relaxed text-content-muted sm:text-base">
              This site is operated by {SITE.legalName}, a hospitality recruitment and management firm based in Kochi, Kerala, India. We refer to ourselves as &quot;Innspireo&quot;, &quot;we&quot; or &quot;us&quot; below.
            </p>
          </section>
          <section>
            <h2 className="text-xl text-content sm:text-2xl">What we collect</h2>
            <p className="mt-3 text-sm leading-relaxed text-content-muted sm:text-base">
              When you create a candidate profile or apply to a role, we collect the details you give us: your name, email address, phone number, current location, nationality, passport validity, work history, qualifications and any CV or supporting documents you upload.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-content-muted sm:text-base">
              When you contact us or send a hiring brief, we collect the contact details and the message content you submit.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-content-muted sm:text-base">
              We also collect standard analytics data about how the site is used, through Google Analytics. This includes pages viewed, approximate location and device type.
            </p>
          </section>
          <section>
            <h2 className="text-xl text-content sm:text-2xl">Why we use it</h2>
            <p className="mt-3 text-sm leading-relaxed text-content-muted sm:text-base">
              We use candidate information for one purpose: to assess your suitability for roles we are recruiting for, to present you to prospective employers, and to process your placement if you are selected. That includes visa, attestation and travel documentation where applicable.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-content-muted sm:text-base">
              We use employer enquiry information to respond to your hiring request and to manage the recruitment mandate.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-content-muted sm:text-base">
              Analytics data is used only in aggregate, to understand which parts of the site are useful and to improve them.
            </p>
          </section>
          <section>
            <h2 className="text-xl text-content sm:text-2xl">Who we share it with</h2>
            <p className="mt-3 text-sm leading-relaxed text-content-muted sm:text-base">
              If you are shortlisted for a role, we share your profile and documents with the prospective employer for that role. We tell you which employer this is during shortlisting.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-content-muted sm:text-base">
              We may share information with the service providers that help us operate, such as hosting and email providers, and with government or visa authorities where this is required to process a placement.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-content-muted sm:text-base">
              We do not sell your personal information, and we do not share it for advertising purposes.
            </p>
          </section>
          <section>
            <h2 className="text-xl text-content sm:text-2xl">How long we keep it</h2>
            <p className="mt-3 text-sm leading-relaxed text-content-muted sm:text-base">
              We keep candidate profiles for as long as you want to be considered for roles. If you ask us to delete your profile, we will do so, except where we are required to retain records relating to a completed placement.
            </p>
          </section>
          <section>
            <h2 className="text-xl text-content sm:text-2xl">Your choices</h2>
            <p className="mt-3 text-sm leading-relaxed text-content-muted sm:text-base">
              You can ask us to access, correct or delete the personal information we hold about you, or ask us to stop contacting you about vacancies. Write to us and we will action it.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-content-muted sm:text-base">
              You can block analytics cookies through your browser settings without affecting your ability to browse or apply.
            </p>
          </section>
          <section>
            <h2 className="text-xl text-content sm:text-2xl">Candidate fees</h2>
            <p className="mt-3 text-sm leading-relaxed text-content-muted sm:text-base">
              We never charge candidates a registration, application or placement fee. If anyone requests payment from you in our name, please report it to us immediately.
            </p>
          </section>
          <section>
            <h2 className="text-xl text-content sm:text-2xl">Changes</h2>
            <p className="mt-3 text-sm leading-relaxed text-content-muted sm:text-base">
              If we change this policy we will update the date at the top of this page.
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
