/**
 * Types mirroring the live Laravel API at https://jobs.innspireo.com/api/jobs
 * Field names and nullability were derived from the actual production payload.
 */

export type JobStatus = "active" | "inactive" | "closed";
export type WorkMode = "remote" | "hybrid" | "on-site";

export interface Company {
  id: number;
  user_id: number | null;
  name: string;
  slug: string;
  logo: string | null;
  website: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  description: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  status: string;
}

export interface Lookup {
  id: number;
  name: string;
  status: string;
}

export interface Country extends Lookup {
  code: string;
}

export interface State extends Lookup {
  country_id: number;
}

export interface Job {
  id: number;
  company_id: number;
  category_id: number;
  experience_level_id: number | null;
  education_level_id: number | null;
  job_type_id: number | null;
  title: string;
  slug: string;
  salary_min: string | null;
  salary_max: string | null;
  currency: string | null;
  vacancies: number | null;
  location: string | null;
  state_id: number | null;
  country_id: number | null;
  work_mode: WorkMode | null;
  shift: string | null;
  gender_preference: string | null;
  age_limit: number | null;
  description: string | null;
  responsibilities: string | null;
  benefits: string | null;
  deadline: string | null;
  status: JobStatus;
  is_featured: boolean;
  is_urgent: boolean;
  created_at: string;
  updated_at: string;
  company?: Company | null;
  category?: Category | null;
  experience_level?: Lookup | null;
  job_type?: Lookup | null;
  education_level?: Lookup | null;
  country?: Country | null;
  state?: State | null;
}

/** Laravel's standard paginator envelope. */
export interface Paginated<T> {
  current_page: number;
  data: T[];
  first_page_url: string | null;
  from: number | null;
  last_page: number;
  last_page_url: string | null;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number | null;
  total: number;
}

export interface JobQuery {
  keyword?: string;
  location?: string;
  category?: string;
  job_type?: string;
  experience?: string;
  work_mode?: string;
  salary_min?: string;
  country?: string;
  sort?: SortOption;
  page?: string;
}

export type SortOption = "newest" | "oldest" | "highest_salary" | "featured";
