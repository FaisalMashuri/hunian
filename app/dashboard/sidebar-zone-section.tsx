import { SidebarZone } from "./sidebar-context";
import { loadDashboardData } from "./data";

// Distribusi budget di sidebar — boundary <Suspense> sendiri. Memakai loader ber-cache()
// yang sama dgn DashboardContent (React men-dedup), jadi tak ada fetch ganda.
export async function SidebarZoneSection({ userId, ideal, max }: { userId: string; ideal: number | null; max: number | null }) {
  const { zoneCount, zoneTotal } = await loadDashboardData(userId, ideal, max);
  return <SidebarZone zoneCount={zoneCount} zoneTotal={zoneTotal} />;
}
