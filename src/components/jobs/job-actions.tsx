"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  Loader2,
  MailWarning,
  Send,
} from "lucide-react";
import { Button, buttonClass } from "@/components/ui/button";
import { Textarea, FieldHint } from "@/components/ui/field";
import { useAuth } from "@/components/auth/auth-provider";
import { resendVerification } from "@/lib/auth";
import { errorMessage } from "@/lib/api-client";
import {
  applyToJob,
  getApplications,
  getSavedJobs,
  saveJob,
  unsaveJob,
} from "@/lib/candidate";

/* -------------------------------------------------------------------------- */
/*  Apply                                                                     */
/* -------------------------------------------------------------------------- */

type ApplyState = "idle" | "composing" | "sending" | "done" | "already";

/**
 * The apply control on a job page.
 *
 * It has four audiences and says something different to each: a visitor who is
 * not signed in, a candidate whose email is not confirmed, one who has already
 * applied, and one who can apply right now. The old version was a single link
 * to /login for everybody.
 */
export function ApplyButton({ slug, title }: { slug: string; title: string }) {
  const { user, status, isVerified } = useAuth();

  const [state, setState] = React.useState<ApplyState>("idle");
  const [note, setNote] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [resent, setResent] = React.useState(false);

  // Has this person already applied? Checked once, so the button can say so
  // instead of letting them click and bounce off a duplicate.
  React.useEffect(() => {
    if (status !== "signed-in" || !isVerified) return;
    let cancelled = false;
    (async () => {
      try {
        const applications = await getApplications();
        if (!cancelled && applications.some((a) => a.job.slug === slug)) {
          setState("already");
        }
      } catch {
        // Not important enough to surface: the apply call itself reports
        // a duplicate cleanly if this check could not run.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug, status, isVerified]);

  async function send() {
    setState("sending");
    setError(null);
    try {
      const result = await applyToJob(slug, note.trim());
      setState(result.message?.includes("already") ? "already" : "done");
    } catch (caught) {
      setError(errorMessage(caught));
      setState("composing");
    }
  }

  // -- not signed in ---------------------------------------------------
  if (status === "loading") {
    return (
      <div className="flex h-13 items-center justify-center gap-2 border border-line text-sm text-content-muted">
        <Loader2 aria-hidden className="size-4 animate-spin" />
        Checking…
      </div>
    );
  }

  if (status === "signed-out" || !user) {
    const next = encodeURIComponent(`/jobs/${slug}`);
    return (
      <>
        <Link href={`/login?next=${next}`} className={buttonClass("primary", "lg", "w-full")}>
          Apply for this role
          <ArrowRight />
        </Link>
        <p className="mt-3 text-center text-xs text-content-subtle">
          Free to apply.{" "}
          <Link href={`/register?next=${next}`} className="underline underline-offset-2">
            Create a profile
          </Link>{" "}
          if you do not have one.
        </p>
      </>
    );
  }

  // -- signed in, email unconfirmed ------------------------------------
  if (!isVerified) {
    return (
      <div className="border border-amber-300 bg-amber-50 p-4">
        <p className="inline-flex items-center gap-2 text-sm font-semibold text-amber-900">
          <MailWarning className="size-4" />
          Confirm your email to apply
        </p>
        <p className="mt-2 text-xs leading-relaxed text-amber-900/85">
          We only pass on applications from an address we know reaches you. Open the
          link we sent to {user.email}.
        </p>
        <Button
          variant="outline"
          size="sm"
          className="mt-3 w-full"
          disabled={resent}
          onClick={async () => {
            await resendVerification(user.email);
            setResent(true);
          }}
        >
          {resent ? "Link sent — check your inbox" : "Resend the link"}
        </Button>
      </div>
    );
  }

  // -- applied ---------------------------------------------------------
  if (state === "already" || state === "done") {
    return (
      <div className="border border-emerald-300 bg-emerald-50 p-4 text-center">
        <p className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-900">
          <CheckCircle2 className="size-4" />
          {state === "done" ? "Application sent" : "You have applied"}
        </p>
        <p className="mt-2 text-xs leading-relaxed text-emerald-900/85">
          Our team reviews every application against the client brief and comes back to
          you either way.
        </p>
        <Link
          href="/applications"
          className={buttonClass("outline", "sm", "mt-3 w-full")}
        >
          Track this application
        </Link>
      </div>
    );
  }

  // -- composing -------------------------------------------------------
  if (state === "composing" || state === "sending") {
    return (
      <div>
        <label
          htmlFor="apply-note"
          className="mb-1.5 block text-sm font-medium text-content"
        >
          Anything to add? <span className="text-content-subtle">(optional)</span>
        </label>
        <Textarea
          id="apply-note"
          rows={4}
          value={note}
          maxLength={4000}
          onChange={(event) => setNote(event.target.value)}
          placeholder={`Why you are a good fit for ${title}, your notice period, or when you can travel.`}
        />
        <FieldHint>Your saved CV is attached automatically.</FieldHint>

        {error ? <FieldHint tone="error">{error}</FieldHint> : null}

        <div className="mt-3 grid gap-2">
          <Button
            variant="primary"
            size="lg"
            onClick={send}
            disabled={state === "sending"}
          >
            {state === "sending" ? <Loader2 className="animate-spin" /> : <Send />}
            {state === "sending" ? "Sending…" : "Send application"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setState("idle")}
            disabled={state === "sending"}
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  // -- ready -----------------------------------------------------------
  return (
    <>
      <Button
        variant="primary"
        size="lg"
        className="w-full"
        onClick={() => setState("composing")}
      >
        Apply for this role
        <ArrowRight />
      </Button>
      <p className="mt-3 text-center text-xs text-content-subtle">
        Free to apply. Your saved CV is attached automatically.
      </p>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*  Save                                                                      */
/* -------------------------------------------------------------------------- */

export function SaveJobButton({
  slug,
  className,
}: {
  slug: string;
  className?: string;
}) {
  const { user, status, isVerified } = useAuth();
  const [isSaved, setIsSaved] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (status !== "signed-in" || !isVerified) return;
    let cancelled = false;
    (async () => {
      try {
        const saved = await getSavedJobs();
        if (!cancelled) setIsSaved(saved.some((s) => s.job.slug === slug));
      } catch {
        // Leave it showing "Save" — the toggle below reports any real failure.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug, status, isVerified]);

  async function toggle() {
    setBusy(true);
    setError(null);
    // Flip first so the control responds immediately, and roll back if the
    // request fails — a save that feels laggy gets clicked twice.
    const previous = isSaved;
    setIsSaved(!previous);
    try {
      if (previous) {
        await unsaveJob(slug);
      } else {
        await saveJob(slug);
      }
    } catch (caught) {
      setIsSaved(previous);
      setError(errorMessage(caught));
    } finally {
      setBusy(false);
    }
  }

  if (status === "loading") return null;

  if (status === "signed-out" || !user) {
    return (
      <Link
        href={`/login?next=${encodeURIComponent(`/jobs/${slug}`)}`}
        className={buttonClass("outline", "md", className)}
      >
        <Bookmark />
        Save this role
      </Link>
    );
  }

  if (!isVerified) {
    return (
      <Button
        variant="outline"
        size="md"
        className={className}
        disabled
        title="Confirm your email address to save roles"
      >
        <Bookmark />
        Save this role
      </Button>
    );
  }

  return (
    <>
      <Button
        variant={isSaved ? "secondary" : "outline"}
        size="md"
        className={className}
        onClick={toggle}
        disabled={busy}
        aria-pressed={isSaved}
      >
        {busy ? (
          <Loader2 className="animate-spin" />
        ) : isSaved ? (
          <BookmarkCheck />
        ) : (
          <Bookmark />
        )}
        {isSaved ? "Saved" : "Save this role"}
      </Button>
      {error ? <FieldHint tone="error">{error}</FieldHint> : null}
    </>
  );
}
