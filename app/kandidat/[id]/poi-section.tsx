import { fetchNearbyPOIs } from "@/lib/maps/poi";
import { PoiExplorer } from "./poi-explorer";

const km = (v: number | null) => (v == null ? "—" : v.toLocaleString("id-ID", { minimumFractionDigits: 1, maximumFractionDigits: 1 }));

function walkabilityLabel(total: number): { score: string; desc: string; tone: string } {
  if (total >= 15) return { score: "Sangat lengkap", desc: `${total}+ POI dalam jangkauan`, tone: "text-emerald-600" };
  if (total >= 7) return { score: "Cukup lengkap", desc: `${total} POI di sekitar`, tone: "text-emerald-600" };
  if (total >= 1) return { score: "Terbatas", desc: `${total} POI ditemukan`, tone: "text-amber-600" };
  return { score: "Sepi", desc: "Tak ada POI terdaftar", tone: "text-zinc-500" };
}

function SummaryCard({ label, value, unit, hint, tone, border }: { label: string; value: string; unit?: string; hint: string; tone: string; border?: string }) {
  return (
    <div className={`rounded-xl border bg-white p-3.5 shadow-sm ${border ?? "border-[#E4E3DF]"}`}>
      <div className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-400">{label}</div>
      <div className={`text-[20px] font-semibold leading-none tabular-nums ${tone}`}>
        {value}
        {unit && <span className="ml-1 text-[12px] font-medium">{unit}</span>}
      </div>
      <div className="mt-1.5 text-[11.5px] text-zinc-500">{hint}</div>
    </div>
  );
}

export async function PoiSection({ home }: { home: { lat: number; lng: number } }) {
  const { pois, summary, error } = await fetchNearbyPOIs(home.lat, home.lng);

  const Header = (
    <div className="mb-3.5 mt-6 flex items-center gap-2">
      <h2 className="text-sm font-bold tracking-tight text-zinc-900">Akses &amp; Lingkungan Sekitar</h2>
      <span className="h-px flex-1 bg-[#E4E3DF]" />
      <span className="flex shrink-0 items-center gap-1.5 text-xs text-zinc-400">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0f766e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
        Data dari OpenStreetMap
      </span>
    </div>
  );

  if (error || pois.length === 0) {
    return (
      <>
        {Header}
        <div className="rounded-2xl border border-dashed border-[#E4E3DF] bg-white p-6 text-center shadow-sm">
          <p className="text-sm font-medium text-zinc-600">{error ? "Data OSM sedang tak tersedia" : "Belum ada POI terdaftar di sekitar sini"}</p>
          <p className="mt-1 text-xs text-zinc-400">{error ?? "OpenStreetMap belum memetakan fasilitas di radius ini."}</p>
        </div>
      </>
    );
  }

  const wa = walkabilityLabel(summary.total);

  return (
    <>
      {Header}
      <div className="mb-3.5 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <SummaryCard label="Kelengkapan" value={wa.score} hint={wa.desc} tone={wa.tone} border="border-emerald-200" />
        <SummaryCard label="Transportasi" value={km(summary.nearestTransport)} unit="km" hint="Halte/stasiun terdekat" tone="text-teal-700" />
        <SummaryCard label="Belanja" value={km(summary.nearestGrocery)} unit="km" hint="Minimarket/pasar terdekat" tone="text-teal-700" />
        <SummaryCard label="Kesehatan" value={km(summary.nearestHealth)} unit="km" hint="Klinik/RS/apotek terdekat" tone={summary.nearestHealth != null && summary.nearestHealth > 2 ? "text-amber-600" : "text-teal-700"} />
      </div>
      <PoiExplorer pois={pois} home={home} />
    </>
  );
}
