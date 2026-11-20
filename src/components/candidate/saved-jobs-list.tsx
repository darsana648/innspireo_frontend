"use client";

import * as React from "react";
import Link from "next/link";
import { Bookmark, Search, Loader2, Trash2 } from "lucide-react";
import { Card, EmptyState, Badge } from "@/components/ui/primitives";
import { Button, buttonClass } from "@/components/ui/button";
import { Loading, ErrorNotice } from "@/components/candidate/account-gate";
import { errorMessage } from "@/lib/api-client";
import { getSavedJobs, unsaveJob, type SavedJobRecord } from "@/lib/candidate";

export function SavedJobsList() {
  const [records, setRecords] = React.useState<SavedJobRecord[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [removing, setRemoving] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const saved = await getSavedJobs();
        if (!cancelled) setRecords(saved);
      } catch (caught) {
        if (!cancelled) setError(errorMessage(caught));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function remove(slug: string) {
    setRemoving(slug);
    setError(null);
    const previous = records;
    // Drop it from the list straight away; put it back if the call fails.
    setRecords((current) => current?.filter((r) => r.job.slug !== slug) ?? current);
    try {
      await unsaveJob(slug);
    } catch (caught) {
      setRecords(previous);
      setError(errorMessage(caught));
    } finally {
      setRemoving(null);
    }
  }

  if (error && !records) return <ErrorNotice>{error}</ErrorNotice>;
  if (!records) return <Loading label="Loading your saved roles…" />;

  if (records.length === 0) {
    return (
      <EmptyState
        icon={<Bookmark />}
        title="Nothing saved yet"
        description="Save a role from its page and it will wait for you here, so you can come back when you have your documents ready."
        action={
          <Link href="/jobs" className={buttonClass("primary", "md")}>
            <Search />
            Browse open roles
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      {error ? <ErrorNotice>{error}</ErrorNotice> : null}

      {records.map((record) => {
        const closed = record.job.status !== "active";
        return (
          <Card key={record.id} className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <Link
                  href={`/jobs/${record.job.slug}`}
                  className="text-base font-medium text-content hover:text-brand-700"
                >
                  {record.job.title}
                </Link>
                <p className="mt-1 text-sm text-content-muted">
                  {[record.job.location, record.job.category_name]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
                <p className="mt-2 text-xs text-content-subtle">
                  Saved {new Date(record.created_at).toLocaleDateString()}
                </p>
              </div>

              <div className="flex flex-col items-end gap-2">
                {closed ? <Badge tone="neutral">Closed</Badge> : null}
                <div className="flex items-center gap-2">
                  <Link
                    href={`/jobs/${record.job.slug}`}
                    className={buttonClass("outline", "sm")}
                  >
                    View role
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(record.job.slug)}
                    disabled={removing === record.job.slug}
                    aria-label={`Remove ${record.job.title} from saved roles`}
                  >
                    {removing === record.job.slug ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <Trash2 />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
