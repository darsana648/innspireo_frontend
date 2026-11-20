import type { Metadata } from "next";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { AccountGate } from "@/components/candidate/account-gate";
import { DashboardOverview } from "@/components/candidate/dashboard-overview";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

export default function DashboardPage() {
  return (
    <DashboardShell
      title="Your dashboard"
      description="Track applications, keep your profile current and see new roles as they open."
      active="/dashboard"
    >
      <AccountGate>
        <DashboardOverview />
      </AccountGate>
    </DashboardShell>
  );
}
