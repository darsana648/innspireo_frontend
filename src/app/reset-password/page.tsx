import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { AuthShell } from "@/components/layout/auth-shell";
import { ResetPasswordPanel } from "@/components/auth/reset-password-panel";

export const metadata: Metadata = {
  title: "Set a new password",
  // Reached only from a one-time emailed link; the token must never be indexed.
  robots: { index: false, follow: false },
};

export default function ResetPasswordPage() {
  return (
    <AuthShell
      title="Set a new password"
      subtitle="Choose a new password for your Innspireo Careers account."
      footer={
        <>
          Remembered it?{" "}
          <Link href="/login" className="font-semibold text-brand-700 hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <Suspense fallback={<p className="text-sm text-content-muted">Loading…</p>}>
        <ResetPasswordPanel />
      </Suspense>
    </AuthShell>
  );
}
