import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/layout/auth-shell";
import { ForgotPasswordForm } from "@/components/forms/auth-forms";

export const metadata: Metadata = {
  title: "Reset Your Password",
  alternates: { canonical: "/forgot-password" },
  robots: { index: false, follow: true },
};

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Reset your password"
      subtitle="Enter the email on your profile and we will send you a link to set a new password."
      footer={
        <p>
          Remembered it?{""}
          <Link
            href="/login"
            className="font-semibold text-brand-600 hover:underline"
          >
            Back to sign in
          </Link>
        </p>
      }
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
