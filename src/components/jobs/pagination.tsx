import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Server-rendered pagination: every page is a real, crawlable link so search
 * engines can reach listings beyond page one.
 */
export function Pagination({
  page,
  lastPage,
  basePath,
  params,
}: {
  page: number;
  lastPage: number;
  basePath: string;
  params: Record<string, string | undefined>;
}) {
  if (lastPage <= 1) return null;

  const href = (p: number) => {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v && k !== "page") qs.set(k, v);
    }
    if (p > 1) qs.set("page", String(p));
    const s = qs.toString();
    return s ? `${basePath}?${s}` : basePath;
  };

  // Compact window: 1 … 4 5 6 … 20
  const window = new Set<number>([1, lastPage, page, page - 1, page + 1]);
  const pages = [...window].filter((p) => p >= 1 && p <= lastPage).sort((a, b) => a - b);

  const cellBase =
    "inline-flex h-10 min-w-10 items-center justify-center rounded-none px-3 text-sm font-medium transition-colors";

  return (
    <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-1.5">
      {page > 1 ? (
        <Link
          href={href(page - 1)}
          rel="prev"
          aria-label="Previous page"
          className={cn(cellBase, "border border-line-strong text-content-muted hover:border-brand-700 hover:text-brand-600")}
        >
          <ChevronLeft className="size-4" />
        </Link>
      ) : (
        <span
          aria-hidden
          className={cn(cellBase, "border border-line text-content-subtle opacity-40")}
        >
          <ChevronLeft className="size-4" />
        </span>
      )}

      {pages.map((p, i) => {
        const prev = pages[i - 1];
        const gap = prev !== undefined && p - prev > 1;
        return (
          <span key={p} className="flex items-center gap-1.5">
            {gap ? (
              <span className="px-1 text-sm text-content-subtle" aria-hidden>
                &hellip;
              </span>
            ) : null}
            {p === page ? (
              <span
                aria-current="page"
                className={cn(cellBase, "bg-brand-900 text-white shadow-soft")}
              >
                {p}
              </span>
            ) : (
              <Link
                href={href(p)}
                aria-label={`Page ${p}`}
                className={cn(
                  cellBase,
                  "border border-line-strong text-content-muted hover:border-brand-700 hover:text-brand-600",
                )}
              >
                {p}
              </Link>
            )}
          </span>
        );
      })}

      {page < lastPage ? (
        <Link
          href={href(page + 1)}
          rel="next"
          aria-label="Next page"
          className={cn(cellBase, "border border-line-strong text-content-muted hover:border-brand-700 hover:text-brand-600")}
        >
          <ChevronRight className="size-4" />
        </Link>
      ) : (
        <span
          aria-hidden
          className={cn(cellBase, "border border-line text-content-subtle opacity-40")}
        >
          <ChevronRight className="size-4" />
        </span>
      )}
    </nav>
  );
}
