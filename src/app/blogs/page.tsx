import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, ArrowUpRight, ArrowRight } from "lucide-react";
import { Badge, Card, Section, SectionHeading } from "@/components/ui/primitives";
import { buttonClass } from "@/components/ui/button";
import { BLOG_POSTS } from "@/lib/content";
import { Reveal } from "@/components/ui/reveal";

export const metadata: Metadata = {
  title: "Career Insights & Industry Notes",
  description:
    "Notes on hospitality hiring, overseas placement and the markets we recruit into, written by the Innspireo team.",
  alternates: { canonical: "/blogs" },
};

export default function BlogsPage() {
  return (
    <>
      <section className="border-b border-line bg-surface-muted">
        <div className="container-page py-12 sm:py-16">
          <Badge tone="brand">
            <BookOpen />
            Career resources
          </Badge>
          <h1 className="mt-4 max-w-2xl text-3xl text-content sm:text-4xl">
            Career insights &amp; industry notes
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-content-muted">
            What we are seeing in hospitality hiring, the markets we place into, and
            practical guidance for building a career abroad.
          </p>
        </div>
      </section>

      <Section>
        <SectionHeading eyebrow="Latest" title="Recent articles" />

        <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {BLOG_POSTS.map((post, i) => (
            <Reveal key={post.slug} delay={i * 70}>
              <Card interactive className="group relative flex h-full flex-col p-6">
              <span
                aria-hidden
                className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-gradient-to-r from-brand-500 to-brand-300 transition-transform duration-500 group-hover:scale-x-100"
              />
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-600">
                {post.category}
              </p>
              <h2 className="mt-3 flex-1 text-lg leading-snug text-content">
                <a
                  href={post.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-brand-600"
                >
                  <span className="absolute inset-0 z-10" aria-hidden />
                  {post.title}
                </a>
              </h2>
              <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-brand-600">
                Read article
                <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
              </Card>
            </Reveal>
          ))}
        </div>

        {/* Honest note: there is no blogs API on the backend yet. */}
        <p className="mt-8 text-xs leading-relaxed text-content-subtle">
          Articles currently open on our existing publishing platform. They will move into
          this site once the content API is available.
        </p>
      </Section>

      <Section muted>
        <Card className="p-8 text-center sm:p-10">
          <h2 className="text-2xl text-content sm:text-3xl">
            Ready to take the next step?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-content-muted sm:text-base">
            Create a candidate profile and we will match you against live vacancies in your
            department and preferred destination.
          </p>
          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/register" className={buttonClass("primary", "lg")}>
              Create your profile
              <ArrowRight />
            </Link>
            <Link href="/jobs" className={buttonClass("outline", "lg")}>
              Browse open roles
            </Link>
          </div>
        </Card>
      </Section>
    </>
  );
}
