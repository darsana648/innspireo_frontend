import Link from "next/link";
import { ArrowRight, Search, UserPlus, Send, Plane } from "lucide-react";
import { buttonClass } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { SITE } from "@/lib/constants";

/**
 * How to apply, in four steps.
 *
 * Written for a cook or a steward reading on a phone, in English that is not
 * their first language. Short sentences, everyday words, one idea each —
 * "we pay for nothing to be sent to you" beats "no placement fee is levied".
 * The home page previously explained the business to employers and never once
 * told a candidate what to actually do.
 */
const STEPS = [
  {
    icon: <Search />,
    title: "Find a job",
    body: "Look at the list of open jobs. Each one shows the country, the pay, and what is included.",
  },
  {
    icon: <UserPlus />,
    title: "Make your profile",
    body: "Fill in your name, your work history, and upload your CV. It takes about ten minutes. It is free.",
  },
  {
    icon: <Send />,
    title: "Press apply",
    body: "Our team reads every application. We will call or email you either way, so you are never left waiting.",
  },
  {
    icon: <Plane />,
    title: "We take you there",
    body: "If the hotel chooses you, we arrange your visa, your papers and your flight, up to the day you start.",
  },
];

export function HowToApply() {
  return (
    <section className="border-y border-line bg-surface-muted">
      <div className="container-page py-14 sm:py-16 lg:py-20">
        <Reveal className="max-w-2xl">
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">
            <span aria-hidden className="size-1.5 bg-brand-900" />
            For job seekers
          </span>
          <h2 className="mt-5 font-display text-3xl font-bold leading-[1.08] text-content text-balance-tight sm:text-4xl">
            How to apply
          </h2>
          <p className="mt-5 text-base leading-relaxed text-content-muted">
            Four steps. You do the first three on this website. We do the rest.
          </p>
        </Reveal>

        <ol className="mt-10 grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, index) => (
            <Reveal
              as="li"
              key={step.title}
              delay={index * 80}
              className="bg-surface p-6"
            >
              <span className="flex items-center gap-3">
                <span
                  aria-hidden
                  className="grid size-10 shrink-0 place-items-center bg-brand-900 text-white [&_svg]:size-4.5"
                >
                  {step.icon}
                </span>
                <span className="font-mono text-xs text-content-subtle">
                  Step {index + 1}
                </span>
              </span>
              <h3 className="mt-5 text-lg text-content">{step.title}</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-content-muted">
                {step.body}
              </p>
            </Reveal>
          ))}
        </ol>

        <Reveal className="mt-10 border border-line bg-surface p-6 sm:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl">
              <p className="text-lg font-semibold text-content">
                You never pay us. Not to apply, not to be placed.
              </p>
              <p className="mt-2 text-sm leading-relaxed text-content-muted">
                The hotel pays our fee, never you. If anybody asks you for money in
                our name, tell us at once on {SITE.phone}.
              </p>
            </div>

            <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
              <Link href="/jobs" className={buttonClass("primary", "lg")}>
                See all jobs
                <ArrowRight />
              </Link>
              <Link href="/register" className={buttonClass("outline", "lg")}>
                Create your profile
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
