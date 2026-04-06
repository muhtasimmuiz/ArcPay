import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import {
  activityItems,
  insightItems,
  navLinks,
  pulseBars,
  summaryStats,
  treasurySnapshot,
  vaultItems
} from "@/components/dashboard/data";

export default function Home() {
  return (
    <DashboardShell
      activityItems={activityItems}
      insightItems={insightItems}
      navLinks={navLinks}
      pulseBars={pulseBars}
      summaryStats={summaryStats}
      treasurySnapshot={treasurySnapshot}
      vaultItems={vaultItems}
    />
  );
}
