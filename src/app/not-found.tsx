import Link from "next/link";
import { SearchX, ArrowRight } from "lucide-react";
import { buttonClass } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <div className="grid size-16 place-items-center rounded-none bg-brand-50 text-brand-600">
        <SearchX className="size-7" />
      </div>
      <p className="mt-6 font-display text-6xl font-bold text-ink-200">
        404
      </p>
      <h1 className="mt-2 text-2xl text-content sm:text-3xl">We could not find that page</h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-content-muted">
        The link may be out of date, or the vacancy may have closed. Browse current openings
        instead — new roles are added as our clients confirm them.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link href="/jobs" className={buttonClass("primary", "lg")}>
          Browse open roles
          <ArrowRight />
        </Link>
        <Link href="/" className={buttonClass("outline", "lg")}>
          Back to home
        </Link>
      </div>
    </div>
  );
}
