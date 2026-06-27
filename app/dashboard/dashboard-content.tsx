import Link from "next/link";
import { DashboardClient } from "./dashboard-client";
import { BudgetMap } from "./budget-map";
import { loadDashboardData } from "./data";

// Konten data dashboard — di-stream di dalam <Suspense>. Memanggil loader ber-cache()
// (di-dedup dgn sub-seksi sidebar). Empty-state ikut di sini agar shell tetap instan.
export async function DashboardContent({ userId, ideal, max }: { userId: string; ideal: number | null; max: number | null }) {
  const { active, archived, counts, insights, points } = await loadDashboardData(userId, ideal, max);

  if (active.length === 0) {
    return (
      <div className="mx-4 mt-6 rounded-3xl border border-dashed border-zinc-300 bg-white px-6 py-14 text-center sm:mx-6">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-2xl text-teal-700">+</div>
        <h3 className="text-lg font-bold tracking-tight text-zinc-900">Shortlistmu masih kosong</h3>
        <p className="mx-auto mt-1.5 max-w-sm text-sm leading-relaxed text-zinc-600">
          Copy deskripsi listing pertama yang sudah kamu temukan dari WA, OLX, atau Mamikos — tempel di sini dan AI yang baca sisanya.
        </p>
        <Link href="/input" className="mt-6 inline-flex h-12 items-center justify-center rounded-xl bg-teal-700 px-6 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-teal-800">
          Tempel Listing Pertama →
        </Link>
      </div>
    );
  }

  return (
    <DashboardClient
      cards={active}
      archived={archived}
      title="Hunian Saya"
      sub={`${counts.aktif} di shortlist · ${counts.disurvey} disurvey`}
      counts={counts}
      insights={insights}
      budgetMap={<BudgetMap ideal={ideal} max={max} points={points} />}
    />
  );
}
