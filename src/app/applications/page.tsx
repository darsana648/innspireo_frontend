import type { Metadata } from "next";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { AccountGate } from "@/components/candidate/account-gate";
import { ApplicationsList } from "@/components/candidate/applications-list";

export const metadata: Metadata = {
  title: "My Applications",
  robots: { index: false, follow: false },
};

export default function ApplicationsPage() {
  return (
    <DashboardShell
      title="My applications"
      description="Every role you have applied to, and exactly where it stands."
      active="/applications"
    >
      <AccountGate requireVerified>
        <ApplicationsList />
      </AccountGate>
    </DashboardShell>
  );
}
