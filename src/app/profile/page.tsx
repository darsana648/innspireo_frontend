import type { Metadata } from "next";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { AccountGate } from "@/components/candidate/account-gate";
import { ProfileForm } from "@/components/candidate/profile-form";

export const metadata: Metadata = {
  title: "My Profile",
  robots: { index: false, follow: false },
};

export default function ProfilePage() {
  return (
    <DashboardShell
      title="My profile"
      description="Keep this current — it is what our team reviews when matching you to a vacancy."
      active="/profile"
    >
      <AccountGate>
        <ProfileForm />
      </AccountGate>
    </DashboardShell>
  );
}
