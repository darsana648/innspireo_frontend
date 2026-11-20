import Link from "next/link";
import Image from "next/image";
import {
  Search,
  MapPin,
  ArrowRight,
  ArrowUpRight,
  TrendingUp,
} from "lucide-react";
import { buttonClass } from "@/components/ui/button";
import { Capsule } from "@/components/ui/primitives";
import { CountUp } from "@/components/ui/count-up";
import { DESTINATIONS, jobsUrl } from "@/lib/constants";
import type { Facets } from "@/lib/api";

const POPULAR = ["Chef de Partie", "Commis", "Sous Chef", "Service Crew"];

export function Hero({ facets }: { facets: Facets }) {
  const liveDestinations = DESTINATIONS.filter((d) => (facets.byDestination[d.slug] ?? 0) > 0);
  const totalOpenings = facets.total;

  return (
    // The negative top margin pulls the hero up underneath the sticky header
    // (pt-3 + h-16 = 4.75rem, pt-4 + h-16 = 5rem from sm up) so the photograph
    // runs to the very top of the page. The matching padding puts the content
    // back below the bar. Header.tsx goes transparent on "/" while unscrolled.
    <section className="relative isolate -mt-[4.75rem] overflow-hidden pt-[4.75rem] sm:-mt-20 sm:pt-20">
      {/* ------------------------------------------------------------------ */}
      {/* Background: the photograph covers the WHOLE hero, including behind  */}
      {/* the search rail. It is decorative beside the copy, so alt="".       */}
      {/*                                                                     */}
      {/* The scrim is not a guess. It is solved against the brightest pixel  */}
      {/* in the half of the frame the copy sits on, which is a blown white   */}
      {/* highlight. At brand-900/72 the headline measures 6.8:1 and white/80 */}
      {/* body copy 5.1:1 over that worst case; 0.70 is the floor where       */}
      {/* white/80 still clears 4.5, so do not lower it. Re-solve this if the */}
      {/* photograph is ever swapped — a brighter image needs a heavier wash. */}
      {/* bg-brand-900 stays underneath, so a failed image load degrades to   */}
      {/* the flat navy design rather than unreadable text.                   */}
      {/* ------------------------------------------------------------------ */}
      <div aria-hidden className="absolute inset-0 -z-10 bg-brand-900">
        <Image
          src="/images/hero-hospitality.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="ken-burns object-cover object-center"
        />
        <div className="absolute inset-0 bg-brand-900/72" />
        {/* Extra weight on the left, where the headline sits. */}
        <div className="absolute inset-0 bg-gradient-to-r from-brand-950/70 via-brand-950/25 to-transparent" />
      </div>

      <div className="container-page py-14 sm:py-20 lg:py-24">
        <div className="grid items-start gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12">
          {/* -------------------------------------------------------------- */}
          {/* Left: the statement, directly on the photograph                 */}
          {/* -------------------------------------------------------------- */}
          <div className="stagger">
            <Capsule inverse className="w-fit">
              Hotel jobs abroad &middot; Gulf &amp; Europe
            </Capsule>

            <h1 className="mt-7 font-display text-[2.625rem] font-bold leading-[1.02] text-white text-balance-tight sm:text-5xl lg:text-[3.75rem]">
              Hotel jobs abroad.
              <br />
              You pay nothing.
              <br />
              <span className="text-brand-200">We help at every step.</span>
            </h1>

            <p className="mt-6 max-w-lg text-base leading-relaxed text-white/80">
              Work in kitchens, restaurants, hotel front desks and housekeeping &mdash;
              in Kuwait, Oman, Qatar, Bahrain, Germany and the Netherlands. We check
              every job before we list it. We stay with you until the day you start.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href={jobsUrl("/jobs")} className={buttonClass("white", "lg")}>
                See all {totalOpenings} jobs
                <ArrowRight />
              </Link>
              <Link href={jobsUrl("/register")} className={buttonClass("inverse", "lg")}>
                Create your free profile
                <ArrowUpRight />
              </Link>
            </div>
          </div>

          {/* -------------------------------------------------------------- */}
          {/* Right: live counts, as a glass panel over the photograph        */}
          {/* White/70 measures only 4.3:1 on this glass, so nothing inside   */}
          {/* drops below white/85.                                          */}
          {/* -------------------------------------------------------------- */}
          <div
            className="rise border border-white/15 bg-white/8 p-6 backdrop-blur-md sm:p-7"
            style={{ animationDelay: "0.35s" }}
          >
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="font-display text-xl font-bold text-white sm:text-2xl">
                Jobs open right now
              </h2>
            </div>

            <ul className="mt-6 divide-y divide-white/10 border-y border-white/10">
              {DESTINATIONS.map((dest) => {
                const count = facets.byDestination[dest.slug] ?? 0;
                return (
                  <li key={dest.slug}>
                    <Link
                      href={jobsUrl(count > 0 ? `/jobs?country=${dest.slug}` : "/register")}
                      className="group flex items-center justify-between gap-3 py-3 transition-colors hover:bg-white/8"
                    >
                      <span className="flex items-center gap-2.5 text-sm text-white">
                        <span className="font-mono text-[0.625rem] uppercase tracking-wider text-white/85">
                          {dest.code}
                        </span>
                        {dest.name}
                      </span>
                      <span className="flex items-center gap-2">
                        <span
                          className={
                            count > 0
                              ? "text-sm font-semibold text-white"
                              : "text-xs text-white/85"
                          }
                        >
                          {count > 0 ? count : "—"}
                        </span>
                        <ArrowUpRight className="size-3.5 text-white/85 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="mt-6 flex items-end justify-between gap-4">
              <div>
                <p className="font-display text-4xl font-bold tabular-nums text-white sm:text-5xl">
                  <CountUp value={String(totalOpenings)} />
                </p>
                <p className="mt-1 text-xs uppercase tracking-[0.14em] text-white/85">
                  Jobs open now
                </p>
              </div>
              {facets.urgent > 0 ? (
                <p className="inline-flex items-center gap-1.5 border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-white">
                  <TrendingUp className="size-3.5" />
                  <CountUp value={String(facets.urgent)} /> need people now
                </p>
              ) : null}
            </div>
          </div>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Search rail — a solid white card sitting on the photograph, so    */}
        {/* the form fields keep normal light-UI contrast and affordance.     */}
        {/* ---------------------------------------------------------------- */}
        <div className="mt-10 border border-line bg-surface p-4 shadow-lift sm:p-5">
          <form
            action={jobsUrl("/jobs")}
            method="GET"
            className="flex flex-col gap-3 lg:flex-row lg:items-center"
          >
            <p className="shrink-0 text-sm font-medium text-content lg:max-w-[11rem]">
              Find your next role
            </p>

            <div className="flex flex-1 flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <label htmlFor="hero-keyword" className="sr-only">
                  Job title or keyword
                </label>
                <Search
                  aria-hidden
                  className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-content-subtle"
                />
                <input
                  id="hero-keyword"
                  type="text"
                  name="keyword"
                  placeholder="Chef, waiter, receptionist…"
                  className="h-12 w-full border border-line-strong bg-surface-muted pl-11 pr-4 text-sm text-content placeholder:text-content-subtle transition-colors hover:border-ink-400 focus:border-brand-700 focus:bg-surface focus:outline-none focus:ring-4 focus:ring-brand-500/12"
                />
              </div>

              <div className="relative sm:w-52">
                <label htmlFor="hero-country" className="sr-only">
                  Destination
                </label>
                <MapPin
                  aria-hidden
                  className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-content-subtle"
                />
                <select
                  id="hero-country"
                  name="country"
                  defaultValue=""
                  className="h-12 w-full cursor-pointer appearance-none border border-line-strong bg-surface-muted pl-11 pr-9 text-sm text-content transition-colors hover:border-ink-400 focus:border-brand-700 focus:bg-surface focus:outline-none focus:ring-4 focus:ring-brand-500/12"
                >
                  <option value="">All destinations</option>
                  {liveDestinations.map((d) => (
                    <option key={d.slug} value={d.slug}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <button type="submit" className={buttonClass("navy", "lg", "shrink-0")}>
                Search
                <ArrowRight />
              </button>
            </div>
          </form>

          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-4">
            <span className="text-xs font-medium uppercase tracking-wider text-content-subtle">
              Popular
            </span>
            {POPULAR.map((term) => (
              <Link
                key={term}
                href={jobsUrl(`/jobs?keyword=${encodeURIComponent(term)}`)}
                className="border border-line bg-surface-muted px-3 py-1.5 text-xs font-medium text-content-muted transition-colors hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700"
              >
                {term}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
