import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/layout/auth-shell";
import { LoginForm } from "@/components/forms/auth-forms";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your Innspireo candidate profile to apply and track applications.",
  alternates: { canonical: "/login" },
  robots: { index: false, follow: true },
};

export default function LoginPage() {
  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to apply, track your applications and keep your documents up to date."
      footer={
        <p>
          New to Innspireo?{""}
          <Link
            href="/register"
            className="font-semibold text-brand-600 hover:underline"
          >
            Create a candidate profile
          </Link>
        </p>
      }
    >
      <Suspense fallback={<div className="h-80" />}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
