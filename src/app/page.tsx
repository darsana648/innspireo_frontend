import type { Metadata } from "next";
import { getFacets, fetchAllJobs } from "@/lib/api";
import { Hero } from "@/components/home/hero";
import {
  StatsBar,
  AboutPreview,
  ServicesPreview,
  TalentSection,
  FaqPreview,
  DegradedBanner,
} from "@/components/home/sections";

export const metadata: Metadata = {
  title: "Hospitality Management & Recruitment, Kochi | Innspireo",
  description:
    "Innspireo Hospitality Management LLP is a 360° hospitality solutions provider in Kochi: recruitment, HR consultancy, training, project launches, turnaround and branding — plus live vacancies across the Gulf and Europe.",
  alternates: { canonical: "/" },
};

export const revalidate = 300;

/**
 * The corporate home page.
 *
 * Vacancy listings deliberately do NOT appear here — individual jobs live only
 * under /jobs, so this page reads as the company's site rather than a job
 * board. The only figure it borrows from the vacancy data is the live count.
 */
export default async function HomePage() {
  const [facets, { degraded }] = await Promise.all([getFacets(), fetchAllJobs()]);

  return (
    <>
      {degraded ? <DegradedBanner /> : null}

      <Hero facets={facets} />

      <StatsBar facets={facets} />

      <AboutPreview />

      <ServicesPreview />

      <TalentSection />

      <FaqPreview />
    </>
  );
}
