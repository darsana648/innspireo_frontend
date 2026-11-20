"use client";

import * as React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, SlidersHorizontal, X, RotateCcw } from "lucide-react";
import { Input, Label, Select } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/primitives";
import {
  CATEGORIES,
  JOB_TYPES,
  EXPERIENCE_LEVELS,
  WORK_MODES,
  DESTINATIONS,
} from "@/lib/constants";
import type { Facets } from "@/lib/api";
import { cn } from "@/lib/utils";

const FILTER_KEYS = [
  "keyword",
  "country",
  "category",
  "job_type",
  "experience",
  "work_mode",
  "salary_min",
] as const;

type FilterKey = (typeof FILTER_KEYS)[number];

export function JobFilters({ facets }: { facets: Facets }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = React.useState(false);

  const current = React.useMemo(() => {
    const out = {} as Record<FilterKey, string>;
    for (const k of FILTER_KEYS) out[k] = searchParams.get(k) ?? "";
    return out;
  }, [searchParams]);

  const [keywordDraft, setKeywordDraft] = React.useState(current.keyword);

  // Keep the text input in sync when the URL changes from elsewhere
  // (a chip removal,"clear all", or back/forward navigation).
  React.useEffect(() => {
    setKeywordDraft(current.keyword);
  }, [current.keyword]);

  const commit = React.useCallback(
    (patch: Partial<Record<FilterKey, string>>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(patch)) {
        if (value) params.set(key, value);
        else params.delete(key);
      }
      // Any filter change invalidates the current page offset.
      params.delete("page");
      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  // Debounce the free-text field so we are not pushing a route per keystroke.
  React.useEffect(() => {
    if (keywordDraft === current.keyword) return;
    const t = setTimeout(() => commit({ keyword: keywordDraft }), 400);
    return () => clearTimeout(t);
  }, [keywordDraft, current.keyword, commit]);

  const activeChips = React.useMemo(() => {
    const chips: { key: FilterKey; label: string }[] = [];
    if (current.keyword) chips.push({ key: "keyword", label: `"${current.keyword}"` });
    if (current.country) {
      const d = DESTINATIONS.find((x) => x.slug === current.country);
      if (d) chips.push({ key: "country", label: d.name });
    }
    if (current.category) {
      const c = CATEGORIES.find((x) => String(x.id) === current.category);
      if (c) chips.push({ key: "category", label: c.name });
    }
    if (current.job_type) {
      const t = JOB_TYPES.find((x) => String(x.id) === current.job_type);
      if (t) chips.push({ key: "job_type", label: t.name });
    }
    if (current.experience) {
      const e = EXPERIENCE_LEVELS.find((x) => String(x.id) === current.experience);
      if (e) chips.push({ key: "experience", label: e.name });
    }
    if (current.work_mode) {
      const w = WORK_MODES.find((x) => x.value === current.work_mode);
      if (w) chips.push({ key: "work_mode", label: w.name });
    }
    if (current.salary_min) {
      chips.push({ key: "salary_min", label: `Min ${current.salary_min}` });
    }
    return chips;
  }, [current]);

  const clearAll = () => {
    const params = new URLSearchParams(searchParams.toString());
    for (const k of FILTER_KEYS) params.delete(k);
    params.delete("page");
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const panel = (
    <div className="space-y-5">
      <div>
        <Label htmlFor="f-keyword">Keyword</Label>
        <Input
          id="f-keyword" icon={<Search />}
          value={keywordDraft}
          onChange={(e) => setKeywordDraft(e.target.value)}
          placeholder="Job title, cuisine, skill…"
          type="search"
        />
      </div>

      <div>
        <Label htmlFor="f-country">Destination</Label>
        <Select
          id="f-country"
          value={current.country}
          onChange={(e) => commit({ country: e.target.value })}
        >
          <option value="">All destinations</option>
          {DESTINATIONS.map((d) => {
            const n = facets.byDestination[d.slug] ?? 0;
            return (
              <option key={d.slug} value={d.slug} disabled={n === 0}>
                {d.name} {n > 0 ? `(${n})` : "(0)"}
              </option>
            );
          })}
        </Select>
      </div>

      <div>
        <Label htmlFor="f-category">Department</Label>
        <Select
          id="f-category"
          value={current.category}
          onChange={(e) => commit({ category: e.target.value })}
        >
          <option value="">All departments</option>
          {CATEGORIES.map((c) => {
            const n = facets.byCategory[c.id] ?? 0;
            return (
              <option key={c.id} value={String(c.id)} disabled={n === 0}>
                {c.name} ({n})
              </option>
            );
          })}
        </Select>
      </div>

      <div>
        <Label htmlFor="f-job-type">Job type</Label>
        <Select
          id="f-job-type"
          value={current.job_type}
          onChange={(e) => commit({ job_type: e.target.value })}
        >
          <option value="">All job types</option>
          {JOB_TYPES.map((t) => {
            const n = facets.byJobType[t.id] ?? 0;
            return (
              <option key={t.id} value={String(t.id)} disabled={n === 0}>
                {t.name} ({n})
              </option>
            );
          })}
        </Select>
      </div>

      <div>
        <Label htmlFor="f-experience">Experience level</Label>
        <Select
          id="f-experience"
          value={current.experience}
          onChange={(e) => commit({ experience: e.target.value })}
        >
          <option value="">All levels</option>
          {EXPERIENCE_LEVELS.map((x) => {
            const n = facets.byExperience[x.id] ?? 0;
            return (
              <option key={x.id} value={String(x.id)} disabled={n === 0}>
                {x.name} ({n})
              </option>
            );
          })}
        </Select>
      </div>

      <div>
        <Label htmlFor="f-work-mode">Work mode</Label>
        <Select
          id="f-work-mode"
          value={current.work_mode}
          onChange={(e) => commit({ work_mode: e.target.value })}
        >
          <option value="">All work modes</option>
          {WORK_MODES.map((w) => {
            const n = facets.byWorkMode[w.value] ?? 0;
            return (
              <option key={w.value} value={w.value} disabled={n === 0}>
                {w.name} ({n})
              </option>
            );
          })}
        </Select>
      </div>

      <div>
        <Label htmlFor="f-salary" hint="In the listing currency">
          Minimum salary
        </Label>
        <Input
          id="f-salary"
          type="number"
          inputMode="numeric"
          min={0}
          step={100}
          defaultValue={current.salary_min}
          onBlur={(e) => commit({ salary_min: e.target.value })}
          placeholder="e.g. 1000"
        />
        <p className="mt-1.5 text-xs text-content-subtle">
          Listings use different currencies and pay periods, so compare the figure on each
          card rather than relying on this alone.
        </p>
      </div>

      {activeChips.length > 0 ? (
        <Button variant="outline" size="md" onClick={clearAll} className="w-full">
          <RotateCcw />
          Clear all filters
        </Button>
      ) : null}
    </div>
  );

  return (
    <>
      {/* Mobile trigger + active chips */}
      <div className="lg:hidden">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="md"
            onClick={() => setOpen(true)}
            className="flex-1"
            aria-expanded={open}
          >
            <SlidersHorizontal />
            Filters
            {activeChips.length > 0 ? (
              <Badge tone="urgent" className="ml-1 px-1.5 py-0.5">
                {activeChips.length}
              </Badge>
            ) : null}
          </Button>
        </div>
      </div>

      {activeChips.length > 0 ? (
        <ul className="mt-3 flex flex-wrap gap-2 lg:hidden">
          {activeChips.map((chip) => (
            <li key={chip.key}>
              <button
                type="button"
                onClick={() => commit({ [chip.key]: "" })}
                className="inline-flex items-center gap-1.5 rounded-none bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-600 transition-colors hover:bg-brand-100"
              >
                {chip.label}
                <X className="size-3" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {/* Mobile drawer */}
      <div
        className={cn("fixed inset-0 z-50 lg:hidden", open ? "" : "pointer-events-none")}
        aria-hidden={!open}
      >
        <div
          onClick={() => setOpen(false)}
          className={cn(
            "absolute inset-0 bg-ink-950/50 backdrop-blur-sm transition-opacity duration-300",
            open ? "opacity-100" : "opacity-0",
          )}
        />
        <div
          className={cn(
            "absolute inset-x-0 bottom-0 max-h-[88vh] overflow-y-auto rounded-none border-t border-line bg-surface p-5 pb-8 shadow-lift transition-transform duration-300",
            open ? "translate-y-0" : "translate-y-full",
          )}
        >
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg text-content">Filter jobs</h2>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close filters"
              className="grid size-9 place-items-center rounded-none text-content-muted hover:bg-surface-muted"
            >
              <X className="size-5" />
            </button>
          </div>
          {panel}
          <Button
            variant="primary"
            size="lg"
            onClick={() => setOpen(false)}
            className="mt-5 w-full"
          >
            Show {facets.total > 0 ? "results" : "jobs"}
          </Button>
        </div>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden lg:block">
        <div className="sticky top-24 rounded-none border border-line bg-surface-raised p-5 shadow-soft">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="inline-flex items-center gap-2 text-base text-content">
              <SlidersHorizontal className="size-4 text-brand-600" />
              Refine
            </h2>
            {activeChips.length > 0 ? (
              <button
                type="button"
                onClick={clearAll}
                className="text-xs font-medium text-brand-600 hover:underline"
              >
                Clear
              </button>
            ) : null}
          </div>
          {panel}
        </div>
      </aside>
    </>
  );
}

/** Sort control — kept separate so it can sit in the results header. */
export function JobSort() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const value = searchParams.get("sort") ?? "newest";

  const onChange = (next: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (next && next !== "newest") params.set("sort", next);
    else params.delete("sort");
    params.delete("page");
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="sort" className="shrink-0 text-sm text-content-subtle">
        Sort
      </label>
      <Select
        id="sort"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-auto min-w-40 text-sm"
      >
        <option value="newest">Newest first</option>
        <option value="oldest">Oldest first</option>
        <option value="highest_salary">Highest salary</option>
        <option value="featured">Featured</option>
      </Select>
    </div>
  );
}

/** Desktop-only active filter chips, rendered above the results grid. */
export function ActiveFilterChips() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const chips: { key: string; label: string }[] = [];
  const get = (k: string) => searchParams.get(k) ?? "";

  if (get("keyword")) chips.push({ key: "keyword", label: `"${get("keyword")}"` });
  const d = DESTINATIONS.find((x) => x.slug === get("country"));
  if (d) chips.push({ key: "country", label: d.name });
  const c = CATEGORIES.find((x) => String(x.id) === get("category"));
  if (c) chips.push({ key: "category", label: c.name });
  const t = JOB_TYPES.find((x) => String(x.id) === get("job_type"));
  if (t) chips.push({ key: "job_type", label: t.name });
  const e = EXPERIENCE_LEVELS.find((x) => String(x.id) === get("experience"));
  if (e) chips.push({ key: "experience", label: e.name });
  const w = WORK_MODES.find((x) => x.value === get("work_mode"));
  if (w) chips.push({ key: "work_mode", label: w.name });
  if (get("salary_min")) chips.push({ key: "salary_min", label: `Min ${get("salary_min")}` });

  if (chips.length === 0) return null;

  const remove = (key: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(key);
    params.delete("page");
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  return (
    <ul className="hidden flex-wrap gap-2 lg:flex">
      {chips.map((chip) => (
        <li key={chip.key}>
          <button
            type="button"
            onClick={() => remove(chip.key)}
            className="inline-flex items-center gap-1.5 rounded-none bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-600 transition-colors hover:bg-brand-100"
          >
            {chip.label}
            <X className="size-3" />
          </button>
        </li>
      ))}
    </ul>
  );
}
