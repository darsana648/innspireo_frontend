"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogIn, MailWarning, Loader2, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/primitives";
import { Button, buttonClass } from "@/components/ui/button";
import { useAuth } from "@/components/auth/auth-provider";
import { resendVerification, authEnabled, NOT_CONFIGURED_MESSAGE } from "@/lib/auth";
import { SITE } from "@/lib/constants";

/** Centred spinner used while any candidate screen loads its data. */
export function Loading({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2.5 border border-line bg-surface px-6 py-16 text-sm text-content-muted">
      <Loader2 aria-hidden className="size-4 animate-spin" />
      {label}
    </div>
  );
}

export function ErrorNotice({ children }: { children: React.ReactNode }) {
  return (
    <Card className="border-rose-300 bg-rose-50 p-5">
      <p className="flex items-start gap-2 text-sm leading-relaxed text-rose-900">
        <AlertCircle aria-hidden className="mt-px size-4 shrink-0" />
        <span>{children}</span>
      </p>
    </Card>
  );
}

/**
 * Prompts an unverified candidate to confirm their address, and resends the
 * link. This is the one blocker standing between a new account and applying,
 * so it says plainly what is blocked and offers the fix in the same place.
 */
export function VerifyBanner({ email }: { email: string }) {
  const [state, setState] = React.useState<"idle" | "sending" | "sent" | "error">("idle");

  async function resend() {
    setState("sending");
    const result = await resendVerification(email);
    setState(result.ok ? "sent" : "error");
  }

  return (
    <Card className="border-amber-300 bg-amber-50 p-5">
      <p className="inline-flex items-center gap-2 text-sm font-semibold text-amber-900">
        <MailWarning className="size-4" />
        Confirm your email address
      </p>
      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-amber-900/85">
        We sent a link to <strong>{email}</strong>. Until you open it you can build your
        profile, but you cannot apply to a vacancy or save one — we only pass on
        applications from an address we know reaches you.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={resend}
          disabled={state === "sending" || state === "sent"}
        >
          {state === "sending"
            ? "Sending…"
            : state === "sent"
              ? "Link sent"
              : "Resend the link"}
        </Button>
        {state === "sent" ? (
          <span className="text-xs text-amber-900/85">
            Check your inbox, including the spam folder.
          </span>
        ) : null}
        {state === "error" ? (
          <span className="text-xs text-rose-700">
            We could not send it just now. Please try again shortly.
          </span>
        ) : null}
      </div>
    </Card>
  );
}

/**
 * Wraps a candidate screen.
 *
 * Renders the sign-in prompt, the "not connected" notice or the children,
 * depending on auth state — so four pages do not each re-implement the same
 * three branches differently.
 */
export function AccountGate({
  children,
  requireVerified = false,
}: {
  children: React.ReactNode;
  requireVerified?: boolean;
}) {
  const { user, status, isVerified } = useAuth();
  const pathname = usePathname();

  if (!authEnabled) {
    return (
      <Card className="border-amber-300 bg-amber-50 p-5">
        <p className="text-sm font-semibold text-amber-900">Not connected</p>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-amber-900/85">
          {NOT_CONFIGURED_MESSAGE}
        </p>
        <p className="mt-3 text-sm">
          <a
            href={`mailto:${SITE.email}`}
            className="font-semibold text-amber-900 underline underline-offset-2"
          >
            {SITE.email}
          </a>
        </p>
      </Card>
    );
  }

  if (status === "loading") return <Loading label="Checking your account…" />;

  if (status === "signed-out" || !user) {
    return (
      <Card className="p-8 text-center">
        <div className="mx-auto grid size-12 place-items-center bg-brand-50 text-brand-600">
          <LogIn className="size-5" />
        </div>
        <h2 className="mt-5 text-lg text-content">Please sign in</h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-content-muted">
          Sign in to see your profile, applications and saved roles.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href={`/login?next=${encodeURIComponent(pathname)}`}
            className={buttonClass("primary", "md")}
          >
            Sign in
          </Link>
          <Link href="/register" className={buttonClass("outline", "md")}>
            Create a profile
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {!isVerified ? <VerifyBanner email={user.email} /> : null}
      {requireVerified && !isVerified ? null : children}
    </div>
  );
}
