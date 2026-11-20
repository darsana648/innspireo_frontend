"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, AlertCircle, Eye, EyeOff } from "lucide-react";
import { Button, buttonClass } from "@/components/ui/button";
import { Input, Label, FieldHint } from "@/components/ui/field";
import { authEnabled, NOT_CONFIGURED_MESSAGE, resetPassword } from "@/lib/auth";
import { SITE } from "@/lib/constants";

export function ResetPasswordPanel() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token") ?? "";

  const [password, setPassword] = React.useState("");
  const [confirmation, setConfirmation] = React.useState("");
  const [reveal, setReveal] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string[]>>({});

  if (!authEnabled) {
    return (
      <div>
        <p className="inline-flex items-center gap-2 text-sm font-semibold text-amber-900">
          <AlertCircle className="size-4" />
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
        </p>
      </div>
    );
  }

  if (!token) {
    return (
      <div>
        <p className="inline-flex items-center gap-2 text-sm font-semibold text-rose-700">
          <AlertCircle className="size-4" />
          No reset link found
        </p>
        <p className="mt-3 text-sm leading-relaxed text-content-muted">
          Open the link from the email we sent you. If it has expired, request a new one.
        </p>
        <Link href="/forgot-password" className={buttonClass("primary", "lg", "mt-6 w-full")}>
          Request a new link
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div>
        <p className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700">
          <CheckCircle2 className="size-4" />
          Password updated
        </p>
        <p className="mt-3 text-sm leading-relaxed text-content-muted">
          You can now sign in with your new password.
        </p>
        <Link href="/login" className={buttonClass("primary", "lg", "mt-6 w-full")}>
          Sign in
        </Link>
      </div>
    );
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setFieldErrors({});

    const result = await resetPassword({
      token,
      password,
      password_confirmation: confirmation,
    });

    setBusy(false);

    if (result.ok) {
      setDone(true);
      // Nudge them onward without trapping anyone who prefers the button.
      setTimeout(() => router.push("/login"), 2500);
      return;
    }

    if ("errors" in result && result.errors) setFieldErrors(result.errors);
    setError(
      ("message" in result && result.message) ||
        "We could not reset your password. The link may have expired.",
    );
  }

  const fieldError = (name: string) => fieldErrors[name]?.[0];

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <div>
        <Label htmlFor="rp-password">New password</Label>
        <div className="relative">
          <Input
            id="rp-password"
            type={reveal ? "text" : "password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="new-password"
            minLength={8}
            required
            className="pr-11"
          />
          <button
            type="button"
            onClick={() => setReveal((v) => !v)}
            aria-label={reveal ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-content-subtle hover:text-content"
          >
            {reveal ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
        {fieldError("password") ? (
          <FieldHint tone="error">{fieldError("password")}</FieldHint>
        ) : (
          <FieldHint>At least 8 characters, and not something easy to guess.</FieldHint>
        )}
      </div>

      <div>
        <Label htmlFor="rp-confirm">Confirm new password</Label>
        <Input
          id="rp-confirm"
          type={reveal ? "text" : "password"}
          value={confirmation}
          onChange={(event) => setConfirmation(event.target.value)}
          autoComplete="new-password"
          required
        />
        {fieldError("password_confirmation") ? (
          <FieldHint tone="error">{fieldError("password_confirmation")}</FieldHint>
        ) : null}
      </div>

      {error ? (
        <p className="flex items-start gap-2 border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-900">
          <AlertCircle className="mt-px size-4 shrink-0" />
          {error}
        </p>
      ) : null}

      <Button type="submit" variant="primary" size="lg" className="w-full" disabled={busy}>
        {busy ? "Saving…" : "Set new password"}
      </Button>
    </form>
  );
}
