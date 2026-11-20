/**
 * The signed-in candidate's own data.
 *
 * NOT CONNECTED YET — see `src/lib/auth.ts`. These are the calls the profile,
 * applications and saved-jobs screens are written against; the endpoints are
 * listed in .env.example for whoever builds the backend.
 *
 * Field names are snake_case, deliberately not re-mapped to camelCase: one
 * shape, from the API response through to the input's `name` attribute, means
 * there is no translation layer to drift.
 */

import { apiGet, apiSend, apiUpload } from "./api-client";

export interface CandidateProfile {
  name: string;
  email: string;
  email_verified_at: string | null;
  phone: string;
  headline: string;
  location: string;
  nationality: string;
  passport_expiry: string | null;
  experience_years: number;
  experience_level_id: number | null;
  summary: string;
  preferred_category_ids: number[];
  preferred_destination_slugs: string[];
  completeness: number;
  cv_file_name: string | null;
  cv_url: string | null;
  cv_updated_at: string | null;
  updated_at: string;
}

export type ProfilePatch = Partial<
  Pick<
    CandidateProfile,
    | "name"
    | "phone"
    | "headline"
    | "location"
    | "nationality"
    | "passport_expiry"
    | "experience_years"
    | "experience_level_id"
    | "summary"
    | "preferred_category_ids"
    | "preferred_destination_slugs"
  >
>;

export type ApplicationStage =
  | "submitted"
  | "under_review"
  | "shortlisted"
  | "interview"
  | "offer"
  | "placed"
  | "not_selected";

export interface ApplicationEvent {
  id: number;
  stage: ApplicationStage;
  stage_label: string;
  note: string;
  created_at: string;
}

export interface JobSummary {
  id: number;
  title: string;
  slug: string;
  location: string | null;
  category_name: string | null;
  status: string;
  deadline: string | null;
}

export interface ApplicationRecord {
  id: number;
  job: JobSummary;
  stage: ApplicationStage;
  stage_label: string;
  cover_note: string;
  created_at: string;
  updated_at: string;
  events: ApplicationEvent[];
}

export interface SavedJobRecord {
  id: number;
  job: JobSummary;
  created_at: string;
}

export const STAGE_LABEL: Record<ApplicationStage, string> = {
  submitted: "Submitted",
  under_review: "Under review",
  shortlisted: "Shortlisted",
  interview: "Interview scheduled",
  offer: "Offer issued",
  placed: "Placed",
  not_selected: "Not selected",
};

/** The pipeline shown by the progress tracker. "Not selected" sits outside it. */
export const STAGE_ORDER: ApplicationStage[] = [
  "submitted",
  "under_review",
  "shortlisted",
  "interview",
  "offer",
  "placed",
];

/* -------------------------------------------------------------------------- */
/*  Profile                                                                   */
/* -------------------------------------------------------------------------- */

export function getProfile() {
  return apiGet<CandidateProfile>("/api/candidate/profile");
}

export function updateProfile(patch: ProfilePatch) {
  return apiSend<CandidateProfile>("PATCH", "/api/candidate/profile", patch);
}

export function uploadCv(file: File) {
  const form = new FormData();
  form.append("cv", file);
  return apiUpload<CandidateProfile>("/api/candidate/cv", form);
}

export function deleteCv() {
  return apiSend<void>("DELETE", "/api/candidate/cv");
}

/* -------------------------------------------------------------------------- */
/*  Applications                                                              */
/* -------------------------------------------------------------------------- */

export function getApplications() {
  return apiGet<ApplicationRecord[]>("/api/candidate/applications");
}

export function applyToJob(slug: string, coverNote?: string) {
  return apiSend<{ message: string; application: ApplicationRecord }>(
    "POST",
    "/api/applications",
    { job: slug, cover_note: coverNote ?? "" },
  );
}

export function withdrawApplication(id: number) {
  return apiSend<void>("DELETE", `/api/candidate/applications/${id}`);
}

/* -------------------------------------------------------------------------- */
/*  Saved jobs                                                                */
/* -------------------------------------------------------------------------- */

export function getSavedJobs() {
  return apiGet<SavedJobRecord[]>("/api/candidate/saved-jobs");
}

export function saveJob(slug: string) {
  return apiSend<SavedJobRecord>("POST", "/api/candidate/saved-jobs", { job: slug });
}

export function unsaveJob(slug: string) {
  return apiSend<void>("DELETE", "/api/candidate/saved-jobs", { job: slug });
}
