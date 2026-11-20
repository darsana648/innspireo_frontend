import type { Metadata } from "next";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { AccountGate } from "@/components/candidate/account-gate";
import { SavedJobsList } from "@/components/candidate/saved-jobs-list";

export const metadata: Metadata = {
  title: "Saved Jobs",
  robots: { index: false, follow: false },
};

export default function SavedJobsPage() {
  return (
    <DashboardShell
      title="Saved roles"
      description="Roles you have bookmarked. They stay here until you remove them."
      active="/saved-jobs"
    >
      <AccountGate requireVerified>
        <SavedJobsList />
      </AccountGate>
    </DashboardShell>
  );
}
