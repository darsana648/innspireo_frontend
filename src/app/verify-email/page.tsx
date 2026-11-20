import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { AuthShell } from "@/components/layout/auth-shell";
import { VerifyEmailPanel } from "@/components/auth/verify-email-panel";

export const metadata: Metadata = {
  title: "Confirm your email",
  // A page reached only from a one-time emailed link has nothing to index, and
  // the token must never end up in a search result.
  robots: { index: false, follow: false },
};

export default function VerifyEmailPage() {
  return (
    <AuthShell
      title="Confirm your email"
      subtitle="One click and your profile is live — then you can apply and save roles."
      footer={
        <>
          Already confirmed?{" "}
          <Link href="/login" className="font-semibold text-brand-700 hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      {/* useSearchParams needs a Suspense boundary during prerender. */}
      <Suspense
        fallback={<p className="text-sm text-content-muted">Loading…</p>}
      >
        <VerifyEmailPanel />
      </Suspense>
    </AuthShell>
  );
}
