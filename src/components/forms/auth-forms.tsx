"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Info, CheckCircle2, LogIn, UserPlus, Send } from "lucide-react";
import { Input, Label, Checkbox, FieldHint } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import {
  login,
  register,
  requestPasswordReset,
  NOT_CONFIGURED_MESSAGE,
  type AuthResult,
} from "@/lib/auth";
import { SITE } from "@/lib/constants";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/* Shared pieces */
/* -------------------------------------------------------------------------- */

function BackendNotice() {
  return (
    <div className="rounded-none border border-amber-300 bg-amber-50 p-4">
      <p className="inline-flex items-center gap-2 text-sm font-semibold text-amber-900">
        <Info className="size-4" />
        Not connected yet
      </p>
      <p className="mt-2 text-sm leading-relaxed text-amber-900/85">
        {NOT_CONFIGURED_MESSAGE}
      </p>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-sm">
        <a
          href={`mailto:${SITE.email}`}
          className="font-semibold text-brand-600 underline underline-offset-2"
        >
          {SITE.email}
        </a>
        <a
          href={`tel:${SITE.phoneHref}`}
          className="font-semibold text-brand-600 underline underline-offset-2"
        >
          {SITE.phone}
        </a>
      </div>
    </div>
  );
}

function ErrorNotice({ children }: { children: React.ReactNode }) {
  return (
    <div
      role="alert"
      className="rounded-none border border-brand-200 bg-brand-50 p-4 text-sm leading-relaxed text-brand-900"
    >
      {children}
    </div>
  );
}

function PasswordInput({
  id,
  value,
  onChange,
  autoComplete,
  invalid,
  placeholder,
}: {
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  autoComplete: string;
  invalid?: boolean;
  placeholder?: string;
}) {
  const [shown, setShown] = React.useState(false);
  return (
    <div className="relative">
      <Input
        id={id}
        type={shown ? "text" : "password"}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        aria-invalid={invalid}
        placeholder={placeholder}
        className="pr-11" required
      />
      <button
        type="button"
        onClick={() => setShown((v) => !v)}
        aria-label={shown ? "Hide password" : "Show password"}
        className="absolute right-0.5 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-none text-content-subtle transition-colors hover:text-content"
      >
        {shown ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );
}

/** Maps an AuthResult failure to copy the user can act on. */
function useAuthError() {
  const [result, setResult] = React.useState<AuthResult | null>(null);

  const node = React.useMemo(() => {
    if (!result || result.ok) return null;
    if (result.code === "not_configured") return <BackendNotice />;
    if (result.code === "invalid_credentials") {
      return <ErrorNotice>That email and password combination did not match.</ErrorNotice>;
    }
    if (result.code === "network") {
      return (
        <ErrorNotice>
          We could not reach the server. Check your connection and try again.
        </ErrorNotice>
      );
    }
    if (result.code === "validation") {
      return (
        <ErrorNotice>
          {result.message ?? "Please check the fields below and try again."}
        </ErrorNotice>
      );
    }
    return <ErrorNotice>Something went wrong on our side. Please try again.</ErrorNotice>;
  }, [result]);

  const fieldErrors =
    result && !result.ok && result.code === "validation" ? (result.errors ?? {}) : {};

  return { setResult, node, fieldErrors };
}

/* -------------------------------------------------------------------------- */
/* Login */
/* -------------------------------------------------------------------------- */

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/dashboard";

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [remember, setRemember] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const { setResult, node, fieldErrors } = useAuthError();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setResult(null);
    const res = await login(email.trim(), password, remember);
    setBusy(false);
    setResult(res);
    if (res.ok) router.push(next);
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      {node}

      <div>
        <Label htmlFor="login-email">Email</Label>
        <Input
          id="login-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="username" autoFocus
          aria-invalid={!!fieldErrors.email}
          required
        />
        {fieldErrors.email?.[0] ? (
          <FieldHint tone="error">{fieldErrors.email[0]}</FieldHint>
        ) : null}
      </div>

      <div>
        <div className="mb-1.5 flex items-baseline justify-between gap-2">
          <span className="text-sm font-medium text-content">Password</span>
          <Link
            href="/forgot-password"
            className="-my-1.5 inline-flex min-h-11 items-center py-1.5 text-xs font-medium text-brand-600 hover:underline"
          >
            Forgot password?
          </Link>
        </div>
        <PasswordInput
          id="login-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          invalid={!!fieldErrors.password}
        />
        {fieldErrors.password?.[0] ? (
          <FieldHint tone="error">{fieldErrors.password[0]}</FieldHint>
        ) : null}
      </div>

      <Checkbox
        id="remember"
        label="Keep me signed in on this device"
        checked={remember}
        onChange={(e) => setRemember(e.target.checked)}
      />

      <Button type="submit" variant="primary" size="lg" disabled={busy} className="w-full">
        {busy ? (
          "Signing in…"
        ) : (
          <>
            <LogIn />
            Sign in
          </>
        )}
      </Button>
    </form>
  );
}

/* -------------------------------------------------------------------------- */
/* Register */
/* -------------------------------------------------------------------------- */

const PASSWORD_RULES = [
  { label: "At least 8 characters", test: (v: string) => v.length >= 8 },
  { label: "One uppercase letter", test: (v: string) => /[A-Z]/.test(v) },
  { label: "One number", test: (v: string) => /\d/.test(v) },
];

export function RegisterForm() {
  const router = useRouter();
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [agreed, setAgreed] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [localError, setLocalError] = React.useState<string | null>(null);
  const { setResult, node, fieldErrors } = useAuthError();

  const strength = PASSWORD_RULES.filter((r) => r.test(password)).length;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLocalError(null);

    if (password !== confirm) {
      setLocalError("The two passwords do not match.");
      return;
    }
    if (strength < PASSWORD_RULES.length) {
      setLocalError("Please choose a password that meets all three rules below.");
      return;
    }
    if (!agreed) {
      setLocalError("Please accept the terms to continue.");
      return;
    }

    setBusy(true);
    setResult(null);
    const res = await register({
      name: name.trim(),
      email: email.trim(),
      password,
      password_confirmation: confirm,
    });
    setBusy(false);
    setResult(res);
    if (res.ok) router.push("/dashboard");
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      {node}
      {localError ? <ErrorNotice>{localError}</ErrorNotice> : null}

      <div>
        <Label htmlFor="reg-name">Full name</Label>
        <Input
          id="reg-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name" autoFocus
          aria-invalid={!!fieldErrors.name}
          required
        />
        {fieldErrors.name?.[0] ? (
          <FieldHint tone="error">{fieldErrors.name[0]}</FieldHint>
        ) : null}
      </div>

      <div>
        <Label htmlFor="reg-email">Email</Label>
        <Input
          id="reg-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="username"
          aria-invalid={!!fieldErrors.email}
          required
        />
        {fieldErrors.email?.[0] ? (
          <FieldHint tone="error">{fieldErrors.email[0]}</FieldHint>
        ) : null}
      </div>

      <div>
        <Label htmlFor="reg-password">Password</Label>
        <PasswordInput
          id="reg-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          invalid={!!fieldErrors.password}
        />
        {/* Strength meter */}
        <div className="mt-2.5 flex gap-1.5" aria-hidden>
          {PASSWORD_RULES.map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-1 flex-1 rounded-none transition-colors",
                i < strength
                  ? strength === 3
                    ? "bg-emerald-500"
                    : "bg-brand-900"
                  : "bg-ink-200",
              )}
            />
          ))}
        </div>
        <ul className="mt-2 space-y-1">
          {PASSWORD_RULES.map((rule) => {
            const met = rule.test(password);
            return (
              <li
                key={rule.label}
                className={cn(
                  "flex items-center gap-1.5 text-xs",
                  met ? "text-emerald-700" : "text-content-subtle",
                )}
              >
                <CheckCircle2 className={cn("size-3.5", !met && "opacity-40")} />
                {rule.label}
              </li>
            );
          })}
        </ul>
      </div>

      <div>
        <Label htmlFor="reg-confirm">Confirm password</Label>
        <PasswordInput
          id="reg-confirm"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          autoComplete="new-password"
          invalid={confirm.length > 0 && confirm !== password}
        />
        {confirm.length > 0 && confirm !== password ? (
          <FieldHint tone="error">Passwords do not match.</FieldHint>
        ) : null}
      </div>

      <Checkbox
        id="agree"
        checked={agreed}
        onChange={(e) => setAgreed(e.target.checked)}
        label={
          <>
            I agree to the{""}
            <Link
              href="/terms"
              className="font-medium text-brand-600 underline underline-offset-2"
            >
              terms
            </Link>{""}
            and{""}
            <Link
              href="/privacy"
              className="font-medium text-brand-600 underline underline-offset-2"
            >
              privacy policy
            </Link>
            .
          </>
        }
      />

      <Button type="submit" variant="primary" size="lg" disabled={busy} className="w-full">
        {busy ? (
          "Creating your profile…"
        ) : (
          <>
            <UserPlus />
            Create my profile
          </>
        )}
      </Button>

      <p className="text-xs leading-relaxed text-content-subtle">
        Innspireo never charges candidates a fee to register, apply or be placed.
      </p>
    </form>
  );
}

/* -------------------------------------------------------------------------- */
/* Forgot password */
/* -------------------------------------------------------------------------- */

export function ForgotPasswordForm() {
  const [email, setEmail] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const { setResult, node, fieldErrors } = useAuthError();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setResult(null);
    const res = await requestPasswordReset(email.trim());
    setBusy(false);
    setResult(res);
    if (res.ok) setDone(true);
  }

  if (done) {
    return (
      <div className="rounded-none border border-line bg-surface-raised p-6 text-center">
        <div className="mx-auto grid size-12 place-items-center rounded-none bg-emerald-50 text-emerald-600">
          <CheckCircle2 className="size-6" />
        </div>
        <h2 className="mt-4 text-lg text-content">Check your inbox</h2>
        <p className="mt-2 text-sm leading-relaxed text-content-muted">
          If an account exists for {email}, we have sent a password reset link to it.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      {node}

      <div>
        <Label htmlFor="fp-email">Email</Label>
        <Input
          id="fp-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="username" autoFocus
          aria-invalid={!!fieldErrors.email}
          required
        />
        {fieldErrors.email?.[0] ? (
          <FieldHint tone="error">{fieldErrors.email[0]}</FieldHint>
        ) : null}
      </div>

      <Button type="submit" variant="primary" size="lg" disabled={busy} className="w-full">
        {busy ? (
          "Sending…"
        ) : (
          <>
            <Send />
            Send reset link
          </>
        )}
      </Button>
    </form>
  );
}
