import Link from "next/link";
import Image from "next/image";
import { auth } from "@/auth";
import { FadeIn, Stagger, StaggerItem, HoverLift } from "@/components/motion/motion";

const VALUE_PROPS = [
  {
    title: "Tidak ada listing yang tercecer lagi",
    body: "Tempel dari WhatsApp, OLX, Mamikos. Yang berserakan jadi satu daftar rapi yang bisa dibandingkan.",
  },
  {
    title: "Tempel, AI baca — kamu tinggal koreksi",
    body: "AI membaca deskripsi jadi data terstruktur. Kamu cukup mengoreksi yang ditandai.",
  },
  {
    title: "Trade-off yang jujur",
    body: "Lihat persis apa yang kamu korbankan di tiap pilihan — dengan alasan yang bisa kamu cek sendiri, bukan angka misterius dari AI.",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Masukkan pilihan yang sudah kamu temukan",
    desc: "Copy deskripsi dari WhatsApp, OLX, Mamikos, atau isi manual. AI baca datanya otomatis — kamu tinggal review dan lengkapi.",
    tags: ["WhatsApp", "OLX", "Mamikos", "Facebook"],
  },
  {
    n: "02",
    title: "Survey dan lengkapi saat kunjungan",
    desc: "Bukan form panjang. Rating bintang untuk 6 aspek penting, selesai dalam 2–3 menit. Sistem langsung perbarui evaluasi.",
    tags: ["Kebersihan ★★★★", "Parkir ★★★", "Owner ★★★★★"],
  },
  {
    n: "03",
    title: "Bandingkan dan putuskan dengan yakin",
    desc: "Bukan ranking angka. Hunian menunjukkan trade-off nyata antar pilihan — apa yang kamu korbankan jika memilih masing-masing.",
    tags: ["Trade-off jelas", "Deal breaker terdeteksi"],
  },
];

function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <Image
        src="/icon.png"
        alt="Hunian"
        width={40}
        height={40}
        priority
        className="h-9 w-9 object-contain"
      />
      <span className="text-xl font-extrabold tracking-tight text-zinc-900">Hunian</span>
    </span>
  );
}

// Stripe block sebagai placeholder foto (on-brand, bukan stok foto).
function PhotoStripe({ className = "" }: { className?: string }) {
  return (
    <div
      className={`rounded-lg ${className}`}
      style={{
        background:
          "repeating-linear-gradient(45deg,#E4E4E7,#E4E4E7 7px,#F4F4F5 7px,#F4F4F5 14px)",
      }}
      aria-hidden="true"
    />
  );
}

export default async function LandingPage() {
  const session = await auth();
  const loggedIn = !!session?.user?.id;
  const ctaHref = loggedIn ? "/dashboard" : "/login";

  return (
    <div className="flex min-h-screen flex-col">
      {/* Structured data (SEO) — sinyal ke Google bahwa ini tool, bukan artikel. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Hunian",
            description:
              "Decision tool untuk membandingkan hunian sewa (kontrakan, kost, apartemen) di Indonesia.",
            applicationCategory: "UtilityApplication",
            operatingSystem: "Web",
            inLanguage: "id",
            offers: { "@type": "Offer", price: "0", priceCurrency: "IDR" },
          }),
        }}
      />
      {/* Nav */}
      <nav className="mx-auto flex w-full max-w-[1120px] items-center justify-between px-6 py-5">
        <Logo />
        <Link
          href={ctaHref}
          className="rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-800"
        >
          {loggedIn ? "Buka aplikasi" : "Masuk & Mulai"}
        </Link>
      </nav>

      <main className="flex-1">
        {/* Hero */}
        <header className="mx-auto grid w-full max-w-[1120px] items-center gap-10 px-6 pb-8 pt-8 lg:grid-cols-[1.02fr_.98fr] lg:gap-[52px] lg:pt-10">
          <FadeIn y={18}>
            <span className="mb-5 inline-flex items-center rounded-full bg-teal-50 px-3 py-1.5 text-[13px] font-semibold text-teal-800">
              Alat bantu pilih hunian sewa di Indonesia
            </span>
            <h1 className="text-[clamp(2.25rem,5vw,3.5rem)] font-extrabold leading-[1.05] tracking-tight text-zinc-900">
              Semakin banyak pilihan.
              <br />
              Semakin mudah
              <br />
              <span className="text-teal-700">salah pilih.</span>
            </h1>
            <p className="mt-5 max-w-[500px] text-lg leading-relaxed text-zinc-600">
              Tempel deskripsi dari WA broker atau OLX — AI baca datanya, Hunian skor tiap pilihan, dan
              kamu lihat <strong className="font-semibold">trade-off yang jelas</strong> sebelum
              memutuskan.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-4">
              <HoverLift>
                <Link
                  href={ctaHref}
                  className="inline-flex h-[52px] items-center justify-center gap-2.5 rounded-xl bg-teal-700 px-6 text-base font-semibold text-white shadow-sm transition-colors hover:bg-teal-800"
                >
                  Mulai Bandingkan Hunianku →
                </Link>
              </HoverLift>
              <span className="text-sm font-medium text-zinc-400">Gratis · masuk dengan Google</span>
            </div>
          </FadeIn>

          {/* Hero visual: compare card */}
          <FadeIn delay={0.15} y={18}>
            <div className="relative pt-2.5">
              <div className="absolute left-1/2 top-[-4px] z-10 -translate-x-1/2 rounded-full bg-zinc-900 px-4 py-2 text-xs font-semibold text-white shadow-lg">
                Mana yang kamu pilih?
              </div>
              <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-2xl shadow-zinc-300/40">
                <div className="grid grid-cols-[1fr_auto_1fr] items-stretch gap-3">
                  {/* A */}
                  <div className="rounded-2xl border-[1.5px] border-emerald-600 bg-emerald-50 p-3">
                    <PhotoStripe className="mb-3 h-[58px]" />
                    <div className="mb-2 text-sm font-semibold text-zinc-900">Rumah A · Tebet</div>
                    <div className="flex flex-col gap-1.5 text-[13px]">
                      <span className="flex items-center gap-1.5 font-semibold text-emerald-600">
                        ✓ Rp 3,5 jt/bln
                      </span>
                      <span className="flex items-center gap-1.5 font-medium text-zinc-500">
                        <span className="text-amber-600">~</span> 6 km ke kantor
                      </span>
                    </div>
                  </div>
                  {/* vs */}
                  <div className="flex items-center justify-center">
                    <span className="flex h-[30px] w-[30px] items-center justify-center rounded-full border border-zinc-200 bg-stone-50 text-xs font-bold text-zinc-400">
                      vs
                    </span>
                  </div>
                  {/* B */}
                  <div className="rounded-2xl border-[1.5px] border-zinc-200 bg-white p-3">
                    <PhotoStripe className="mb-3 h-[58px]" />
                    <div className="mb-2 text-sm font-semibold text-zinc-900">Rumah B · Pancoran</div>
                    <div className="flex flex-col gap-1.5 text-[13px]">
                      <span className="flex items-center gap-1.5 font-semibold text-emerald-600">
                        ✓ 3 km ke kantor
                      </span>
                      <span className="flex items-center gap-1.5 font-medium text-zinc-500">
                        <span className="text-amber-600">~</span> Rp 600rb lebih mahal
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-3.5 rounded-xl bg-stone-50 px-4 py-3 text-[13.5px] leading-relaxed text-zinc-800">
                  Pilih <strong className="text-teal-800">A</strong> → hemat Rp 600rb tiap bulan, tapi
                  15 menit lebih jauh. Trade-off-nya jelas — kamu yang putuskan.
                </div>
              </div>
            </div>
          </FadeIn>
        </header>

        {/* Value props */}
        <section className="mx-auto w-full max-w-[1120px] px-6 pb-3.5 pt-14 text-center">
          <FadeIn>
            <h2 className="text-[clamp(1.6rem,3.4vw,2.4rem)] font-bold tracking-tight text-zinc-900">
              Berhenti membandingkan di kepala.
            </h2>
            <p className="mx-auto mt-3 max-w-[540px] text-[17px] leading-relaxed text-zinc-600">
              Tujuh listing di WhatsApp, tiga tab OLX, satu catatan di HP. Hunian merapikan semuanya
              jadi satu tempat untuk memutuskan.
            </p>
          </FadeIn>
          <Stagger className="mt-10 grid gap-[18px] text-left sm:grid-cols-3">
            {VALUE_PROPS.map((vp) => (
              <StaggerItem key={vp.title}>
                <HoverLift className="h-full">
                  <div className="h-full rounded-2xl border border-zinc-200 bg-white p-6">
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-lg text-emerald-600">
                      ✓
                    </div>
                    <h3 className="text-lg font-semibold tracking-tight text-zinc-900">{vp.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-zinc-600">{vp.body}</p>
                  </div>
                </HoverLift>
              </StaggerItem>
            ))}
          </Stagger>
        </section>

        {/* Reframe — Masalah sebenarnya */}
        <section className="mx-auto w-full max-w-[1120px] px-6 py-16 sm:py-[72px]">
          <FadeIn>
            <div className="mx-auto max-w-[640px] text-center">
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.08em] text-teal-700">
                Masalah sebenarnya
              </p>
              <h2 className="text-[clamp(1.6rem,3.5vw,2.375rem)] font-extrabold leading-[1.2] tracking-tight text-zinc-900">
                Bukan kurang informasi.
                <br />
                Kamu butuh cara untuk mengeliminasi,
                <br />
                bukan sekadar mencatat.
              </h2>
              <div className="mx-auto my-8 h-[3px] w-12 rounded-full bg-teal-700" />
              <p className="text-base leading-[1.7] text-zinc-600">
                Marketplace bagus untuk menemukan pilihan. Tapi tidak ada yang membantu kamu{" "}
                <em>memutuskan</em> dari pilihan yang sudah kamu temukan. Hunian mengisi gap itu.
              </p>
            </div>
          </FadeIn>
        </section>

        {/* Cara kerja */}
        <section className="mx-auto w-full max-w-[1120px] px-6 py-16 sm:py-[72px]">
          <FadeIn>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.08em] text-teal-700">
              Cara kerja
            </p>
            <h2 className="mb-12 max-w-[500px] text-[clamp(1.6rem,3vw,2.25rem)] font-extrabold tracking-tight text-zinc-900">
              Tiga langkah dari bingung ke yakin
            </h2>
          </FadeIn>
          <Stagger className="grid gap-8 sm:grid-cols-3 sm:gap-6">
            {STEPS.map((s) => (
              <StaggerItem key={s.n}>
                <div className="relative">
                  <div className="mb-4 inline-flex h-7 w-7 items-center justify-center rounded-lg bg-teal-50 font-mono text-xs font-semibold text-teal-700">
                    {s.n}
                  </div>
                  <h3 className="mb-2 text-base font-bold leading-snug tracking-tight text-zinc-900">
                    {s.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-zinc-600">{s.desc}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {s.tags.map((t) => (
                      <span
                        key={t}
                        className="rounded-full border border-zinc-200 bg-[#F0EEE8] px-2.5 py-[3px] text-[11.5px] font-medium text-zinc-600"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </section>

        {/* Fitur utama — Compare */}
        <section className="mx-auto w-full max-w-[1120px] px-6 py-16 sm:py-[72px]">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-[72px]">
            {/* Copy */}
            <FadeIn>
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.08em] text-teal-700">
                Fitur utama
              </p>
              <h2 className="mb-4 text-[clamp(1.6rem,3vw,2.125rem)] font-extrabold leading-[1.2] tracking-tight text-zinc-900">
                Compare yang jujur tentang trade-off
              </h2>
              <p className="mb-7 text-[15px] leading-[1.7] text-zinc-600">
                Marketplace hanya menampilkan opsi. Hunian menunjukkan{" "}
                <em>apa yang kamu korbankan</em> jika memilih masing-masing — supaya keputusanmu
                berdasarkan trade-off yang kamu pahami, bukan angka yang terlihat paling tinggi.
              </p>
              <ul className="flex flex-col gap-3">
                {[
                  "Deal breaker langsung terdeteksi dan di-flag — tidak perlu tunggu sampai sudah terlanjur suka",
                  "Kalau ada pilihan yang kalah di semua aspek dibanding pilihan lain, Hunian langsung memberi tahu",
                  "Evaluasi diperbarui setiap kali ada data baru — termasuk setelah survey",
                  "Setiap rekomendasi ada alasannya — bisa kamu cek, bukan percaya begitu saja",
                ].map((li) => (
                  <li key={li} className="flex items-start gap-2.5 text-sm leading-snug text-zinc-600">
                    <span className="mt-0.5 shrink-0 font-bold text-emerald-600">✓</span>
                    {li}
                  </li>
                ))}
              </ul>
            </FadeIn>

            {/* Big compare card */}
            <FadeIn delay={0.12}>
              <div className="overflow-hidden rounded-[20px] border border-zinc-200 bg-white shadow-[0_16px_32px_rgba(15,14,12,0.08)]">
                <div className="flex items-center gap-2 border-b border-zinc-200 bg-stone-50 px-[18px] py-3.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F56]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#FFBD2E]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#27C93F]" />
                  <span className="ml-1 text-[13px] font-bold text-zinc-900">Hunian · Compare</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="w-[32%] border-b border-zinc-200 bg-[#F7F6F3] px-4 py-2.5 text-left text-xs font-semibold text-zinc-400">
                          —
                        </th>
                        <th className="border-b border-zinc-200 bg-teal-50 px-4 py-2.5 text-left text-xs font-semibold text-teal-700">
                          Jatiwaringin ✓
                        </th>
                        <th className="border-b border-zinc-200 bg-[#F7F6F3] px-4 py-2.5 text-left text-xs font-semibold text-zinc-400">
                          Skandinavia
                        </th>
                      </tr>
                    </thead>
                    <tbody className="[&_td]:border-b [&_td]:border-zinc-200 [&_td]:px-4 [&_td]:py-2.5 [&_td]:align-middle [&_td]:text-[13px] [&_tr:last-child_td]:border-b-0">
                      <tr>
                        <td className="font-semibold text-zinc-900">Harga all-in</td>
                        <td><span className="font-mono text-emerald-600">Rp 3.200.000</span></td>
                        <td><span className="font-mono text-amber-600">Rp 4.100.000</span></td>
                      </tr>
                      <tr>
                        <td className="font-semibold text-zinc-900">vs budget ideal</td>
                        <td>
                          <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-[11.5px] font-medium text-emerald-700">
                            91% ideal ✓
                          </span>
                        </td>
                        <td>
                          <span className="inline-flex rounded-full bg-amber-50 px-2 py-0.5 text-[11.5px] font-medium text-amber-700">
                            117% ideal ~
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="font-semibold text-zinc-900">Jarak kantor</td>
                        <td className="text-amber-600">6,4 km ~</td>
                        <td className="text-emerald-600">3,1 km ✓</td>
                      </tr>
                      <tr>
                        <td className="font-semibold text-zinc-900">Kondisi survey</td>
                        <td>
                          <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-[11.5px] font-medium text-emerald-700">
                            ★★★★☆
                          </span>
                        </td>
                        <td>
                          <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-[11.5px] font-medium text-emerald-700">
                            ★★★★★
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="font-semibold text-zinc-900">Deal Breaker</td>
                        <td className="text-xs font-bold text-emerald-600">✓ Tidak ada</td>
                        <td className="text-xs font-bold text-rose-600">✗ Parkir tidak ada</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="border-t border-zinc-200 bg-gradient-to-br from-[#EBF7FA] to-[#F0FDF4] px-[18px] py-4">
                  <div className="mb-2.5 text-[13px] font-bold text-teal-700">
                    Pilih Jatiwaringin berarti:
                  </div>
                  <p className="text-[13px] leading-relaxed text-zinc-600">
                    <strong className="text-zinc-900">✓ Hemat Rp 900rb/bulan</strong> dibanding
                    Skandinavia
                    <br />
                    <strong className="text-zinc-900">✓ Tidak ada deal breaker aktif</strong>
                    <br />
                    <strong className="text-zinc-900">~ 3 km lebih jauh</strong> dari kantor dibanding
                    Skandinavia
                  </p>
                </div>
              </div>
            </FadeIn>
          </div>
        </section>
      </main>

      {/*<footer className="mx-auto w-full max-w-[1120px] px-6 pb-12 pt-4 text-center">*/}
      {/*  <span className="text-[13px] font-medium text-zinc-400">*/}
      {/*    Hunian · Slice 1 — Kontrakan*/}
      {/*  </span>*/}
      {/*</footer>*/}
    </div>
  );
}
