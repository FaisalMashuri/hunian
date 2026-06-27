import { type Poi, type PoiCategory } from "@/lib/maps/poi";
import { loadCandidatePois } from "@/lib/maps/poi-cache";
import { PoiExplorer } from "./poi-explorer";
import { resolveHome, type HomeInput } from "./location";

// Gate POI — resolusi koordinat (dedup dgn MapSection via cache()), lalu render PoiSection.
// Dipisah agar seluruh kerja lokasi+Overpass berada dalam satu boundary <Suspense> (non-blocking).
export async function PoiGate({ candidate, userId }: { candidate: HomeInput; userId: string }) {
  const { home } = await resolveHome(candidate, userId);
  if (!home) return null;
  return <PoiSection home={{ lat: home.lat, lng: home.lng }} candidateId={candidate.id} />;
}

const km = (v: number | null) => (v == null ? "—" : v.toLocaleString("id-ID", { minimumFractionDigits: 1, maximumFractionDigits: 1 }));

// Nilai kartu summary: pakai jarak tempuh jalan (rute asli) bila POI terdekat sudah dihitung, fallback garis lurus.
function nearestCard(pois: Poi[], cats: PoiCategory[]): { value: string; isRoute: boolean } {
  const hit = pois.find((p) => cats.includes(p.category)); // pois sudah urut by jarak garis lurus
  if (!hit) return { value: "—", isRoute: false };
  const isRoute = hit.routeKm != null;
  return { value: km(hit.routeKm ?? hit.distanceKm), isRoute };
}

function walkabilityLabel(total: number): { score: string; desc: string; tone: string } {
  if (total >= 15) return { score: "Sangat lengkap", desc: `${total}+ fasilitas dalam jangkauan`, tone: "text-emerald-600" };
  if (total >= 7) return { score: "Cukup lengkap", desc: `${total} fasilitas di sekitar`, tone: "text-emerald-600" };
  if (total >= 1) return { score: "Terbatas", desc: `${total} fasilitas ditemukan`, tone: "text-amber-600" };
  return { score: "Sepi", desc: "Belum ada fasilitas terdaftar", tone: "text-zinc-500" };
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

export async function PoiSection({ home, candidateId }: { home: { lat: number; lng: number }; candidateId: string }) {
  // S2-7: muat POI ter-cache per kandidat (Overpass hanya saat cache kosong/stale) + rute asli top-N.
  const { pois, summary, error } = await loadCandidatePois(candidateId, home);
  const enriched = pois;

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
          <p className="text-sm font-medium text-zinc-600">{error ? "Data OSM sedang tak tersedia" : "Belum ada fasilitas terdaftar di sekitar sini"}</p>
          <p className="mt-1 text-xs text-zinc-400">
            {error
              ? /429|sibuk/i.test(error)
                ? "Server peta OpenStreetMap sedang sibuk (rate limit). Muat ulang sebentar lagi — hasilnya akan tersimpan setelah berhasil sekali."
                : error
              : "OpenStreetMap belum memetakan fasilitas di radius ini."}
          </p>
        </div>
      </>
    );
  }

  const wa = walkabilityLabel(summary.total);
  const tr = nearestCard(enriched, ["transport"]);
  const gr = nearestCard(enriched, ["grocery"]);
  const he = nearestCard(enriched, ["health"]);
  const rt = (isRoute: boolean) => (isRoute ? "rute asli" : "garis lurus");
  const healthKm = he.value === "—" ? null : Number(he.value.replace(",", "."));

  return (
    <>
      {Header}
      <div className="mb-3.5 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <SummaryCard label="Kelengkapan" value={wa.score} hint={wa.desc} tone={wa.tone} border="border-emerald-200" />
        <SummaryCard label="Transportasi" value={tr.value} unit="km" hint={`Halte/stasiun · ${rt(tr.isRoute)}`} tone="text-teal-700" />
        <SummaryCard label="Belanja" value={gr.value} unit="km" hint={`Minimarket/pasar · ${rt(gr.isRoute)}`} tone="text-teal-700" />
        <SummaryCard label="Kesehatan" value={he.value} unit="km" hint={`Klinik/RS/apotek · ${rt(he.isRoute)}`} tone={healthKm != null && healthKm > 2 ? "text-amber-600" : "text-teal-700"} />
      </div>
      <PoiExplorer pois={enriched} home={home} />
    </>
  );
}
