import type { Metadata } from "next";
import Link from "next/link";
import { HelpCircle, ArrowRight } from "lucide-react";
import { Accordion } from "@/components/ui/accordion";
import { Badge, Card, Section, SectionHeading } from "@/components/ui/primitives";
import { buttonClass } from "@/components/ui/button";
import { FAQS } from "@/lib/content";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description:
    "How Innspireo placement works: fees, documents, visas, accommodation, interview formats and why employer names are disclosed at shortlisting.",
  alternates: { canonical: "/faqs" },
};

const GROUPS = ["Applying", "Placement", "Working abroad", "Employers"] as const;

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((f) => ({
    "@type": "Question",
    name: f.question,
    acceptedAnswer: { "@type": "Answer", text: f.answer },
  })),
};

export default function FaqsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <section className="border-b border-line bg-surface-muted">
        <div className="container-page py-12 sm:py-16">
          <Badge tone="brand">
            <HelpCircle />
            {FAQS.length} questions answered
          </Badge>
          <h1 className="mt-4 max-w-2xl text-3xl text-content sm:text-4xl">
            Frequently asked questions
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-content-muted">
            Straight answers on fees, documents, visas and how our placement process
            actually runs. If something is missing, ask us directly.
          </p>
        </div>
      </section>

      {GROUPS.map((group, i) => {
        const items = FAQS.filter((f) => f.group === group);
        if (items.length === 0) return null;
        return (
          <Section key={group} muted={i % 2 === 1}>
            <SectionHeading eyebrow={group} title={group} />
            <div className="mt-8">
              <Accordion
                items={items.map((f) => ({ question: f.question, answer: f.answer }))}
              />
            </div>
          </Section>
        );
      })}

      <Section>
        <Card className="p-8 text-center sm:p-10">
          <h2 className="text-2xl text-content sm:text-3xl">Still have a question?</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-content-muted sm:text-base">
            Our recruitment desk in Kochi answers candidate and employer questions directly.
          </p>
          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/contact" className={buttonClass("primary", "lg")}>
              Contact our team
              <ArrowRight />
            </Link>
            <a href={`tel:${SITE.phoneHref}`} className={buttonClass("outline", "lg")}>
              Call {SITE.phone}
            </a>
          </div>
        </Card>
      </Section>
    </>
  );
}
