"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, AlertCircle, MailWarning } from "lucide-react";
import { Button, buttonClass } from "@/components/ui/button";
import { Input, Label, FieldHint } from "@/components/ui/field";
import { useAuth } from "@/components/auth/auth-provider";
import {
  authEnabled,
  NOT_CONFIGURED_MESSAGE,
  resendVerification,
  verifyEmail,
} from "@/lib/auth";
import { SITE } from "@/lib/constants";

type State = "working" | "ok" | "failed" | "missing";

/**
 * Lands the link from the verification email.
 *
 * The emailed URL points here rather than at the API so the person stays
 * inside the branded site; this panel reads `?token=` and posts it to
 * `/api/email/verify`. The token is single use, so a second visit to the same
 * link legitimately fails — hence the resend path right alongside the error.
 */
export function VerifyEmailPanel() {
  const params = useSearchParams();
  const token = params.get("token");
  const { user, refresh } = useAuth();

  const [state, setState] = React.useState<State>(token ? "working" : "missing");
  const [message, setMessage] = React.useState<string | null>(null);

  const [email, setEmail] = React.useState("");
  const [resent, setResent] = React.useState(false);
  const [resending, setResending] = React.useState(false);

  React.useEffect(() => {
    if (!token) return;
    let cancelled = false;
    (async () => {
      const result = await verifyEmail(token);
      if (cancelled) return;
      if (result.ok) {
        setState("ok");
        setMessage(result.message ?? "Your email address is confirmed.");
        void refresh();
      } else {
        setState("failed");
        setMessage(
          ("message" in result && result.message) ||
            "This confirmation link is invalid or has expired.",
        );
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, refresh]);

  async function resend() {
    const address = (user?.email ?? email).trim();
    if (!address) return;
    setResending(true);
    await resendVerification(address);
    setResending(false);
    setResent(true);
  }

  // Without a backend there is nothing to confirm against, and reporting the
  // link as broken would blame the candidate for our own missing endpoint.
  if (!authEnabled) {
    return (
      <div>
        <p className="inline-flex items-center gap-2 text-sm font-semibold text-amber-900">
          <MailWarning className="size-4" />
          Not connected yet
        </p>
        <p className="mt-3 text-sm leading-relaxed text-content-muted">
          {NOT_CONFIGURED_MESSAGE}
        </p>
        <p className="mt-4 text-sm">
          <a
            href={`mailto:${SITE.email}`}
            className="font-semibold text-brand-700 underline underline-offset-2"
          >
            {SITE.email}
          </a>
          <span className="mx-2 text-content-subtle">·</span>
          <a
            href={`tel:${SITE.phoneHref}`}
            className="font-semibold text-brand-700 underline underline-offset-2"
          >
            {SITE.phone}
          </a>
        </p>
      </div>
    );
  }

  if (state === "working") {
    return (
      <div className="flex items-center gap-2.5 text-sm text-content-muted">
        <Loader2 aria-hidden className="size-4 animate-spin" />
        Confirming your email address…
      </div>
    );
  }

  if (state === "ok") {
    return (
      <div>
        <p className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700">
          <CheckCircle2 className="size-4" />
          Email confirmed
        </p>
        <p className="mt-3 text-sm leading-relaxed text-content-muted">
          {message} You can now apply to vacancies and save roles to come back to.
        </p>
        <div className="mt-6 grid gap-2.5 sm:grid-cols-2">
          <Link href="/jobs" className={buttonClass("primary", "lg")}>
            Browse open roles
          </Link>
          <Link href="/dashboard" className={buttonClass("outline", "lg")}>
            Go to my dashboard
          </Link>
        </div>
      </div>
    );
  }

  // missing | failed
  return (
    <div>
      <p className="inline-flex items-center gap-2 text-sm font-semibold text-rose-700">
        {state === "missing" ? (
          <MailWarning className="size-4" />
        ) : (
          <AlertCircle className="size-4" />
        )}
        {state === "missing" ? "No confirmation link found" : "That link did not work"}
      </p>
      <p className="mt-3 text-sm leading-relaxed text-content-muted">
        {state === "missing"
          ? "Open the link from the email we sent you. If you no longer have it, request a new one below."
          : `${message} Links expire, and each one can only be used once — request a fresh one below.`}
      </p>

      <div className="mt-6">
        {user ? (
          <p className="text-sm text-content-muted">
            Signed in as <strong className="text-content">{user.email}</strong>.
          </p>
        ) : (
          <>
            <Label htmlFor="verify-email">Your email address</Label>
            <Input
              id="verify-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </>
        )}

        <Button
          variant="primary"
          size="lg"
          className="mt-4 w-full"
          onClick={resend}
          disabled={resending || resent || (!user && !email.trim())}
        >
          {resending ? "Sending…" : resent ? "Link sent" : "Send a new link"}
        </Button>

        {resent ? (
          <FieldHint>
            If an account exists for that address, a new link is on its way. Check your
            inbox, including the spam folder.
          </FieldHint>
        ) : null}
      </div>
    </div>
  );
}
