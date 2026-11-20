import type { MetadataRoute } from "next";
import { getAllJobSlugs, fetchAllJobs } from "@/lib/api";
import { SITE } from "@/lib/constants";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE.url;
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${base}/jobs`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/services`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/hire-with-us`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/faqs`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/blogs`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    { url: `${base}/contact`, lastModified: now, changeFrequency: "yearly", priority: 0.5 },
    { url: `${base}/register`, lastModified: now, changeFrequency: "yearly", priority: 0.5 },
    { url: `${base}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  // Job pages carry the real last-modified date from the API.
  const { jobs } = await fetchAllJobs();
  const jobRoutes: MetadataRoute.Sitemap = jobs
    .filter((j) => j.status === "active")
    .map((j) => ({
      url: `${base}/jobs/${j.slug}`,
      lastModified: new Date(j.updated_at ?? j.created_at),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

  // Keep the import used even if the jobs fetch is empty.
  void getAllJobSlugs;

  return [...staticRoutes, ...jobRoutes];
}
