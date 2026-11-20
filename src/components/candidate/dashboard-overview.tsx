"use client";

import * as React from "react";
import Link from "next/link";
import { FileText, Bookmark, Search, User, ArrowRight, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/primitives";
import { buttonClass } from "@/components/ui/button";
import { Loading, ErrorNotice } from "@/components/candidate/account-gate";
import { useAuth } from "@/components/auth/auth-provider";
import { errorMessage } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import {
  getApplications,
  getProfile,
  getSavedJobs,
  type ApplicationRecord,
  type CandidateProfile,
  type SavedJobRecord,
} from "@/lib/candidate";

interface Loaded {
  profile: CandidateProfile;
  applications: ApplicationRecord[];
  saved: SavedJobRecord[];
}

export function DashboardOverview() {
  const { user, isVerified } = useAuth();
  const [data, setData] = React.useState<Loaded | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // Saved jobs and applications both need a confirmed email, so an
        // unverified account asks only for the profile rather than firing two
        // requests it knows will be refused.
        const [profile, applications, saved] = await Promise.all([
          getProfile(),
          isVerified ? getApplications() : Promise.resolve([] as ApplicationRecord[]),
          isVerified ? getSavedJobs() : Promise.resolve([] as SavedJobRecord[]),
        ]);
        if (!cancelled) setData({ profile, applications, saved });
      } catch (caught) {
        if (!cancelled) setError(errorMessage(caught));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isVerified]);

  if (error) return <ErrorNotice>{error}</ErrorNotice>;
  if (!data) return <Loading label="Loading your dashboard…" />;

  const { profile, applications, saved } = data;
  const open = applications.filter(
    (a) => a.stage !== "placed" && a.stage !== "not_selected",
  );

  const tasks = [
    { done: Boolean(user?.email_verified_at), label: "Confirm your email address" },
    { done: Boolean(profile.phone), label: "Add a phone number" },
    { done: Boolean(profile.headline), label: "Add your current role" },
    { done: Boolean(profile.cv_file_name), label: "Upload your CV" },
    { done: Boolean(profile.passport_expiry), label: "Add your passport expiry" },
    {
      done: profile.preferred_destination_slugs.length > 0,
      label: "Choose where you want to work",
    },
  ];
  const remaining = tasks.filter((t) => !t.done);

  return (
    <div className="space-y-6">
      {/* Completeness */}
      <Card className="p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg text-content">
              {profile.name ? `Welcome back, ${profile.name.split(" ")[0]}` : "Welcome back"}
            </h2>
            <p className="mt-1 text-sm text-content-muted">
              {remaining.length === 0
                ? "Your profile is complete. We will be in touch when a matching role opens."
                : `${remaining.length} thing${remaining.length === 1 ? "" : "s"} left to finish your profile.`}
            </p>
          </div>
          <p className="font-display text-3xl font-bold text-brand-900">
            {profile.completeness}%
          </p>
        </div>

        <div
          className="mt-4 h-2 overflow-hidden bg-ink-200"
          role="progressbar"
          aria-valuenow={profile.completeness}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Profile completeness"
        >
          <div
            className="h-full bg-brand-900 transition-all duration-700"
            style={{ width: `${profile.completeness}%` }}
          />
        </div>

        {remaining.length > 0 ? (
          <>
            <ul className="mt-5 grid gap-2.5 sm:grid-cols-2">
              {tasks.map((task) => (
                <li key={task.label} className="flex items-center gap-2.5 text-sm">
                  <span
                    aria-hidden
                    className={cn(
                      "grid size-4.5 shrink-0 place-items-center border",
                      task.done
                        ? "border-emerald-500 bg-emerald-500 text-white"
                        : "border-line-strong text-transparent",
                    )}
                  >
                    <CheckCircle2 className="size-3" />
                  </span>
                  <span className={task.done ? "text-content-subtle line-through" : "text-content-muted"}>
                    {task.label}
                  </span>
                </li>
              ))}
            </ul>
            <Link href="/profile" className={buttonClass("outline", "sm", "mt-5")}>
              <User />
              Complete my profile
            </Link>
          </>
        ) : null}
      </Card>

      {/* Counters */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={<FileText />}
          value={applications.length}
          label="Applications"
          href="/applications"
        />
        <StatCard icon={<ArrowRight />} value={open.length} label="In progress" href="/applications" />
        <StatCard icon={<Bookmark />} value={saved.length} label="Saved roles" href="/saved-jobs" />
      </div>

      {/* Recent applications */}
      <Card className="p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg text-content">Recent applications</h2>
          {applications.length > 0 ? (
            <Link
              href="/applications"
              className="text-sm font-medium text-brand-700 hover:underline"
            >
              View all
            </Link>
          ) : null}
        </div>

        {applications.length === 0 ? (
          <div className="mt-4">
            <p className="text-sm text-content-muted">
              {isVerified
                ? "You have not applied to anything yet."
                : "Confirm your email address to start applying."}
            </p>
            <Link href="/jobs" className={buttonClass("primary", "sm", "mt-4")}>
              <Search />
              Browse open roles
            </Link>
          </div>
        ) : (
          <ul className="mt-4 divide-y divide-line">
            {applications.slice(0, 5).map((application) => (
              <li
                key={application.id}
                className="flex flex-wrap items-center justify-between gap-3 py-3"
              >
                <Link
                  href={`/jobs/${application.job.slug}`}
                  className="min-w-0 text-sm font-medium text-content hover:text-brand-700"
                >
                  {application.job.title}
                </Link>
                <span className="text-xs text-content-subtle">
                  {application.stage_label}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

function StatCard({
  icon,
  value,
  label,
  href,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
  href: string;
}) {
  return (
    <Link href={href} className="block">
      <Card interactive className="p-5">
        <span className="grid size-9 place-items-center bg-brand-50 text-brand-600 [&_svg]:size-4">
          {icon}
        </span>
        <p className="mt-4 font-display text-3xl font-bold text-content">{value}</p>
        <p className="mt-0.5 text-sm text-content-muted">{label}</p>
      </Card>
    </Link>
  );
}
