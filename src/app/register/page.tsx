import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/layout/auth-shell";
import { RegisterForm } from "@/components/forms/auth-forms";

export const metadata: Metadata = {
  title: "Create Your Candidate Profile",
  description:
    "Create a free Innspireo candidate profile to apply for hospitality jobs across the Gulf and Europe. No fees, ever.",
  alternates: { canonical: "/register" },
};

export default function RegisterPage() {
  return (
    <AuthShell
      title="Create your profile"
      subtitle="One profile gives you access to every vacancy we place. It takes about a minute."
      footer={
        <p>
          Already registered?{""}
          <Link
            href="/login"
            className="font-semibold text-brand-600 hover:underline"
          >
            Sign in instead
          </Link>
        </p>
      }
    >
      <RegisterForm />
    </AuthShell>
  );
}
