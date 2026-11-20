"use client";

import * as React from "react";
import Link from "next/link";
import { FileText, Search, Loader2, XCircle } from "lucide-react";
import { Card, Badge, EmptyState } from "@/components/ui/primitives";
import { Button, buttonClass } from "@/components/ui/button";
import { Loading, ErrorNotice } from "@/components/candidate/account-gate";
import { errorMessage } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import {
  getApplications,
  withdrawApplication,
  STAGE_ORDER,
  type ApplicationRecord,
} from "@/lib/candidate";

function stageIndex(record: ApplicationRecord): number {
  const index = STAGE_ORDER.indexOf(record.stage);
  // "Not selected" is outside the pipeline, so the tracker shows it as
  // complete-but-stopped rather than pretending it is still at step one.
  return index === -1 ? STAGE_ORDER.length - 1 : index;
}

export function ApplicationsList() {
  const [records, setRecords] = React.useState<ApplicationRecord[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [withdrawing, setWithdrawing] = React.useState<number | null>(null);

  const load = React.useCallback(async () => {
    try {
      setRecords(await getApplications());
    } catch (caught) {
      setError(errorMessage(caught));
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  async function withdraw(id: number) {
    setWithdrawing(id);
    try {
      await withdrawApplication(id);
      await load();
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setWithdrawing(null);
    }
  }

  if (error) return <ErrorNotice>{error}</ErrorNotice>;
  if (!records) return <Loading label="Loading your applications…" />;

  if (records.length === 0) {
    return (
      <EmptyState
        icon={<FileText />}
        title="You have not applied to anything yet"
        description="When you apply, this page tracks each application through submitted, review, shortlisting, interview, offer and placement."
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
      {records.map((record) => {
        const index = stageIndex(record);
        const rejected = record.stage === "not_selected";

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
              </div>
              <Badge tone={rejected ? "neutral" : "brand"}>{record.stage_label}</Badge>
            </div>

            {/* Progress tracker */}
            <ul className="mt-5 flex gap-1" aria-label="Application progress">
              {STAGE_ORDER.map((stage, position) => (
                <li key={stage} className="flex-1">
                  <span
                    className={cn(
                      "block h-1.5",
                      rejected
                        ? "bg-ink-300"
                        : position <= index
                          ? "bg-brand-900"
                          : "bg-ink-200",
                    )}
                    title={stage}
                  />
                </li>
              ))}
            </ul>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-content-subtle">
                Applied {new Date(record.created_at).toLocaleDateString()}
                {record.updated_at !== record.created_at
                  ? ` · updated ${new Date(record.updated_at).toLocaleDateString()}`
                  : ""}
              </p>

              {record.stage !== "placed" && !rejected ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => withdraw(record.id)}
                  disabled={withdrawing === record.id}
                >
                  {withdrawing === record.id ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <XCircle />
                  )}
                  Withdraw
                </Button>
              ) : null}
            </div>

            {record.events.length > 0 ? (
              <details className="mt-4 border-t border-line pt-4">
                <summary className="cursor-pointer text-sm font-medium text-content-muted hover:text-content">
                  History ({record.events.length})
                </summary>
                <ol className="mt-3 space-y-2">
                  {record.events.map((event) => (
                    <li key={event.id} className="flex gap-3 text-sm">
                      <span className="shrink-0 text-xs text-content-subtle">
                        {new Date(event.created_at).toLocaleDateString()}
                      </span>
                      <span className="text-content-muted">{event.stage_label}</span>
                    </li>
                  ))}
                </ol>
              </details>
            ) : null}
          </Card>
        );
      })}
    </div>
  );
}
