import Link from "next/link";
import Image from "next/image";
import { auth } from "@/auth";
import { LandingEffects } from "./landing-effects";

// Ikon Material Symbols (ligature). Font dimuat via <link> di bawah.
function Icon({ name, className = "", fill = false }: { name: string; className?: string; fill?: boolean }) {
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={fill ? { fontVariationSettings: "'FILL' 1" } : undefined}
      aria-hidden
    >
      {name}
    </span>
  );
}

export default async function LandingPage() {
  const session = await auth();
  const loggedIn = !!session?.user?.id;
  const ctaHref = loggedIn ? "/dashboard" : "/login";

  return (
    <div className="bg-surface text-on-surface antialiased selection:bg-primary-container selection:text-white">
      {/* Fonts (Plus Jakarta Sans, Inter, JetBrains Mono, Material Symbols) — dihoist ke <head>. */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
      />
      <LandingEffects />

      {/* TopNavBar */}
      <nav
        id="topNav"
        className="glass-nav fixed top-9 z-50 w-full border-b border-outline-variant/20 bg-surface/80 py-4 backdrop-blur-md transition-all duration-300"
      >
        <div className="mx-auto flex max-w-max-width items-center justify-between px-margin-mobile py-0 md:px-margin-desktop">
          <div className="flex items-center gap-3">
            <Image alt="Hunian Logo" width={32} height={32} className="h-8 w-auto rounded-lg" src="/icon.png" />
            <span className="font-headline-md text-headline-md font-bold text-primary">Hunian</span>
          </div>
          {/* Desktop nav */}
          <div className="hidden items-center gap-8 md:flex">
            <a className="font-label-md text-label-md text-on-surface-variant transition-colors duration-200 hover:text-primary" href="#features">Features</a>
            <a className="font-label-md text-label-md text-on-surface-variant transition-colors duration-200 hover:text-primary" href="#how-it-works">How it Works</a>
            <a className="font-label-md text-label-md text-on-surface-variant transition-colors duration-200 hover:text-primary" href="#pricing">Pricing</a>
            <a className="font-label-md text-label-md text-on-surface-variant transition-colors duration-200 hover:text-primary" href="#faq">FAQ</a>
            <Link className="font-label-md text-label-md font-bold text-primary transition-colors duration-200 hover:text-primary" href={ctaHref}>
              {loggedIn ? "Buka App" : "Login"}
            </Link>
          </div>
          {/* Mobile menu button */}
          <a href="#features" className="text-primary md:hidden">
            <Icon name="menu" />
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-max-width overflow-hidden px-margin-mobile pb-24 pt-32 md:px-margin-desktop md:pb-32 md:pt-40">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
          {/* Copy */}
          <div className="z-10 space-y-8 lg:col-span-5">
            <div className="animate-hero-text inline-flex items-center gap-2 rounded-full border border-primary-fixed-dim bg-teal-light px-3 py-1 font-label-md text-[12px] text-primary">
              <Icon name="auto_awesome" className="text-sm" fill />
              Decision-Grade Data Extraction
            </div>
            <h1 className="animate-hero-text font-display-lg text-display-lg text-on-surface">
              Bandingkan Hunian,{" "}
              <span className="relative inline-block text-primary-container">
                Putuskan dengan Yakin
                <svg className="absolute -bottom-2 left-0 h-3 w-full text-secondary-container opacity-50" preserveAspectRatio="none" viewBox="0 0 100 10">
                  <path d="M0,5 Q50,10 100,0" fill="none" stroke="currentColor" strokeWidth="4" />
                </svg>
              </span>
              .
            </h1>
            <p className="animate-hero-desc max-w-lg font-body-lg text-body-lg text-on-surface-variant">
              Bebas ribet ngetik ulang. AI kami otomatis merapikan info dari WA atau marketplace jadi perbandingan yang jelas dan objektif. Saatnya pilih hunian yang paling menguntungkan buat kamu, bukan cuma modal perasaan.
            </p>
            <div className="animate-hero-cta flex flex-col gap-4 pt-4 sm:flex-row">
              <Link
                href={ctaHref}
                className="group flex items-center justify-center gap-2 rounded-lg bg-primary-container px-8 py-4 font-label-md text-label-md text-white shadow-[0_4px_14px_0_rgba(15,118,110,0.39)] transition-all duration-200 hover:bg-teal-dark hover:shadow-[0_6px_20px_rgba(15,118,110,0.23)]"
              >
                Mulai Bandingkan Hunianku
                <Icon name="arrow_forward" className="transition-transform group-hover:translate-x-1" />
              </Link>
              {/*<a*/}
              {/*  href="#how-it-works"*/}
              {/*  className="flex items-center justify-center gap-2 rounded-lg border border-outline-variant px-8 py-4 font-label-md text-label-md text-on-surface-variant transition-colors duration-200 hover:bg-surface-container-highest"*/}
              {/*>*/}
              {/*  <Icon name="play_circle" />*/}
              {/*  Lihat Demo*/}
              {/*</a>*/}
            </div>
          </div>

          {/* Hero visual — peta blur (latar) + kartu Comparison Matrix melayang */}
          <div className="relative lg:col-span-7">
            {/* Peta di-blur sebagai latar */}
            <div className="absolute inset-0 overflow-hidden rounded-3xl border border-outline-variant/30 shadow-2xl shadow-primary/10">
              <Image
                src="/hero-overlay.png"
                alt="Peta perbandingan hunian"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 640px"
                className="scale-110 object-cover blur-[3px]"
              />
              <div className="pointer-events-none absolute inset-0 bg-surface/50" />
            </div>

            {/* Kartu Comparison Matrix melayang */}
            <div className="relative flex justify-center px-4 py-8 sm:px-10 sm:py-12">
              <div className="animate-float w-full max-w-[470px] overflow-hidden rounded-3xl border border-outline-variant/60 bg-surface-container-lowest shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between px-6 pb-4 pt-5">
                  <h3 className="font-headline-md text-2xl font-bold text-on-surface">Comparison Matrix</h3>
                  <span className="animate-pulse-subtle flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 font-label-md text-xs text-white shadow-sm">
                    <Icon name="verified" className="text-[15px]" /> Worth It Pick
                  </span>
                </div>

                <div className="divide-y divide-surface-container-highest border-t border-surface-container-highest">
                  {[
                    {
                      name: "Rumah Kebayoran",
                      price: "Rp 120jt / thn",
                      thumb: "/thumb-rumah.jpg",
                      active: true,
                      tags: [
                        { icon: "space_dashboard", text: "Luas 120m²", tone: "gray", iconTeal: true },
                        { icon: "water_drop", text: "Rawan Banjir (Low)", tone: "red" },
                      ],
                    },
                    {
                      name: "Apartemen Sudirman",
                      price: "Rp 8jt / bln",
                      thumb: "/thumb-apartemen.jpg",
                      active: false,
                      tags: [
                        { icon: "directions_subway", text: "2 Min MRT", tone: "teal" },
                        { icon: "monetization_on", text: "Maintenance Tinggi", tone: "gray" },
                      ],
                    },
                    {
                      name: "Kost Tebet",
                      price: "Rp 3jt / bln",
                      thumb: "/thumb-kost.jpg",
                      active: false,
                      tags: [
                        { icon: "local_dining", text: "Banyak Kuliner", tone: "gray" },
                        { icon: "no_crash", text: "Parkir Sempit", tone: "red" },
                      ],
                    },
                  ].map((r) => (
                    <div key={r.name} className="relative flex items-start gap-4 px-6 py-4">
                      {r.active && <span className="absolute inset-y-0 left-0 w-1.5 bg-primary-container" />}
                      <Image src={r.thumb} alt={r.name} width={56} height={56} className="h-14 w-14 shrink-0 rounded-lg object-cover" />
                      <div className="min-w-0 flex-1">
                        <h4 className="font-table-data text-lg font-bold text-on-surface">{r.name}</h4>
                        <p className="font-label-md text-sm text-on-surface-variant">{r.price}</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {r.tags.map((t) => (
                            <span
                              key={t.text}
                              className={`inline-flex items-center gap-1 rounded px-2 py-1 font-label-md text-[11px] ${
                                t.tone === "red"
                                  ? "bg-error-container text-on-error-container"
                                  : t.tone === "teal"
                                    ? "border border-primary-fixed-dim bg-teal-light text-primary-container"
                                    : "bg-surface-container text-on-surface-variant"
                              }`}
                            >
                              <Icon name={t.icon} className={`text-[14px] ${"iconTeal" in t && t.iconTeal ? "text-primary" : ""}`} /> {t.text}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Problem */}
      <section id="features" className="overflow-hidden border-y border-outline-variant/30 bg-surface-container-low py-24">
        <div className="reveal mx-auto max-w-max-width px-margin-mobile text-center md:px-margin-desktop">
          <h2 className="mb-6 font-headline-lg text-headline-lg text-on-surface">Berhenti Membandingkan di Kepala</h2>
          <p className="mx-auto mb-12 max-w-2xl font-body-lg text-body-lg text-on-surface-variant">
            Tujuh listing di WhatsApp, tiga tab OLX, satu catatan di HP. Capek ngetik ulang? Takut salah pilih?
          </p>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="reveal group rounded-2xl border border-outline-variant/50 bg-surface-container-lowest p-8 text-left shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-error-container text-on-error-container transition-transform group-hover:scale-110">
                <Icon name="chat_error" />
              </div>
              <h3 className="mb-3 font-headline-md text-lg">Chat WhatsApp Berantakan</h3>
              <p className="font-body-md text-on-surface-variant">Info harga, fasilitas, dan lokasi tersebar di belasan chat agen yang susah dilacak kembali.</p>
            </div>
            <div className="reveal group rounded-2xl border border-outline-variant/50 bg-surface-container-lowest p-8 text-left shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-secondary-fixed text-on-secondary-fixed transition-transform group-hover:scale-110">
                <Icon name="tab" />
              </div>
              <h3 className="mb-3 font-headline-md text-lg">Tab Browser Menumpuk</h3>
              <p className="font-body-md text-on-surface-variant">Pindah-pindah tab OLX dan Rumah123 cuma bikin pusing membandingkan spesifikasi.</p>
            </div>
            <div className="reveal group rounded-2xl border border-outline-variant/50 bg-surface-container-lowest p-8 text-left shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-surface-variant text-on-surface-variant transition-transform group-hover:scale-110">
                <Icon name="note_alt" />
              </div>
              <h3 className="mb-3 font-headline-md text-lg">Catatan Manual Melelahkan</h3>
              <p className="font-body-md text-on-surface-variant">Mencatat ulang di Excel atau Notes HP membuang waktu dan rawan ada detail yang terlewat.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="mx-auto max-w-max-width px-margin-mobile py-24 md:px-margin-desktop">
        <div className="reveal mb-16 text-center">
          <h2 className="font-headline-lg text-headline-lg text-on-surface">Cara Kerja yang Transparan</h2>
          <p className="mt-4 font-body-lg text-on-surface-variant">Tiga langkah mudah untuk keputusan yang tepat.</p>
        </div>
        <div className="relative grid grid-cols-1 gap-12 md:grid-cols-3">
          <div className="absolute left-20 right-20 top-12 -z-10 hidden h-0.5 bg-surface-variant md:block" />
          {[
            { n: "01", title: "Paste Listing", desc: "Copy-paste link atau teks berantakan dari WA/OLX. AI kami akan mengekstrak datanya." },
            { n: "02", title: "Quick Survey", desc: "30 detik verifikasi saat Anda survey langsung ke lokasi untuk memastikan data sesuai." },
            { n: "03", title: "Decision Analysis", desc: "Lihat trade-off yang jelas antara properti. Putuskan dengan percaya diri." },
          ].map((s) => (
            <div key={s.n} className="reveal text-center">
              <div className="group relative mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full border-4 border-surface bg-surface-container-lowest shadow-sm transition-transform duration-300 hover:scale-105">
                <span className="font-display-lg text-2xl text-primary-container transition-colors group-hover:text-primary">{s.n}</span>
              </div>
              <h3 className="mb-3 font-headline-md text-xl">{s.title}</h3>
              <p className="font-body-md text-on-surface-variant">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bukti Output */}
      <section className="bg-surface px-margin-mobile py-24 text-on-surface md:px-margin-desktop">
        <div className="mx-auto max-w-max-width">
          <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
            <div className="reveal">
              <h2 className="mb-6 font-headline-lg text-headline-lg">Bukti Nyata, Bukan Tebakan</h2>
              <p className="mb-8 font-body-lg text-on-surface-variant">
                Inilah yang Anda dapatkan: sebuah &apos;Trade-off Memo&apos; komprehensif. Kami menyortir kelebihan dan kekurangan secara objektif untuk membantu Anda melihat realita setiap hunian.
              </p>
              <ul className="space-y-4 font-body-md text-on-surface-variant">
                <li className="flex items-center gap-3 transition-transform hover:translate-x-1">
                  <Icon name="check_circle" className="text-primary" /> Perbandingan Harga vs Value
                </li>
                <li className="flex items-center gap-3 transition-transform hover:translate-x-1">
                  <Icon name="check_circle" className="text-primary" /> Analisa Waktu Commute
                </li>
                <li className="flex items-center gap-3 transition-transform hover:translate-x-1">
                  <Icon name="check_circle" className="text-primary" /> Logika &apos;Worth It&apos; yang jelas
                </li>
              </ul>
            </div>
            {/* Output Visual */}
            <div className="reveal rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 shadow-lg transition-shadow duration-300 hover:shadow-xl">
              <div className="mb-4 flex items-center justify-between border-b border-surface-container-highest pb-4">
                <h3 className="font-headline-md text-lg">Decision Summary</h3>
                <span className="animate-pulse-subtle rounded bg-teal-light px-2 py-1 font-label-md text-xs text-primary-container">Generated Memo</span>
              </div>
              <div className="space-y-6">
                <div className="rounded-xl border border-primary-fixed-dim/50 bg-teal-light/30 p-4 transition-colors hover:bg-teal-light/50">
                  <h4 className="mb-2 font-bold text-on-primary-fixed-variant">💡 Worth It Logic: Rumah Kebayoran</h4>
                  <p className="text-sm leading-relaxed text-on-surface-variant">
                    Meskipun harganya 20% lebih tinggi dari budget awal, menghemat 45 menit perjalanan harian (PP) bernilai lebih tinggi. Fasilitas sesuai dengan kebutuhan jangka panjang keluarga.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl border border-outline-variant/30 bg-surface p-4 transition-colors hover:border-primary/30">
                    <h5 className="mb-2 flex items-center gap-1 font-label-md text-secondary-container">
                      <Icon name="trending_up" className="text-[16px]" /> Pros
                    </h5>
                    <ul className="list-disc space-y-1 pl-4 text-sm text-on-surface-variant">
                      <li>Lokasi strategis (Dekat tol)</li>
                      <li>Lingkungan asri &amp; tenang</li>
                      <li>Ruang tamu luas</li>
                    </ul>
                  </div>
                  <div className="rounded-xl border border-outline-variant/30 bg-surface p-4 transition-colors hover:border-error/30">
                    <h5 className="mb-2 flex items-center gap-1 font-label-md text-error">
                      <Icon name="trending_down" className="text-[16px]" /> Cons
                    </h5>
                    <ul className="list-disc space-y-1 pl-4 text-sm text-on-surface-variant">
                      <li>Over budget Rp20jt/thn</li>
                      <li>Butuh sedikit renovasi dapur</li>
                      <li>Parkiran luar sempit</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Credibility / Trust */}
      <section className="overflow-hidden bg-primary py-20 text-white">
        <div className="reveal mx-auto max-w-max-width px-margin-mobile text-center md:px-margin-desktop">
          <h2 className="mb-6 font-headline-lg text-3xl">Data-driven, Not a feeling.</h2>
          <p className="mx-auto mb-10 max-w-3xl font-body-lg text-primary-fixed">
            Kami tidak memilihkan hunian untuk Anda. Kami hanya membersihkan dan menyusun data yang berantakan agar Anda bisa melihat fakta dengan jelas. Keputusan akhir, selalu di tangan Anda.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <div className="flex items-center gap-2 rounded-full border border-primary-fixed-dim/30 bg-primary-container/50 px-4 py-2 transition-all hover:bg-primary-container/70">
              <Icon name="lock" />
              <span className="font-label-md text-sm">Privasi Terjaga</span>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-primary-fixed-dim/30 bg-primary-container/50 px-4 py-2 transition-all hover:bg-primary-container/70">
              <Icon name="fact_check" />
              <span className="font-label-md text-sm">100% Objektif</span>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-primary-fixed-dim/30 bg-primary-container/50 px-4 py-2 transition-all hover:bg-primary-container/70">
              <Icon name="person_play" />
              <span className="font-label-md text-sm">Human in the Loop</span>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      {/*<section id="pricing" className="bg-surface-container-low px-margin-mobile py-24 md:px-margin-desktop">*/}
      {/*  <div className="reveal mx-auto max-w-3xl rounded-3xl border border-outline-variant bg-surface-container-lowest p-12 text-center shadow-xl">*/}
      {/*    <span className="mb-6 inline-block rounded-full bg-tertiary-fixed px-3 py-1 font-label-md text-xs text-on-tertiary-fixed-variant">Simple Pricing</span>*/}
      {/*    <h2 className="mb-4 font-display-lg text-4xl">Selamanya Gratis<br />untuk Pencari Hunian</h2>*/}
      {/*    <p className="mb-8 font-body-lg text-on-surface-variant">Tidak ada biaya tersembunyi. Fokus saja mencari tempat tinggal terbaik Anda.</p>*/}
      {/*    <Link*/}
      {/*      href={ctaHref}*/}
      {/*      className="inline-flex items-center gap-3 rounded-lg bg-on-surface px-8 py-4 font-label-md text-surface-container-lowest transition-all duration-300 hover:scale-[1.02] hover:bg-zinc-dark active:scale-95"*/}
      {/*    >*/}
      {/*      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">*/}
      {/*        <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.761H12.545z" />*/}
      {/*      </svg>*/}
      {/*      Masuk dengan Google*/}
      {/*    </Link>*/}
      {/*    <p className="mt-4 font-label-md text-xs text-on-surface-variant opacity-70">Tanpa kartu kredit.</p>*/}
      {/*  </div>*/}
      {/*</section>*/}

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-3xl px-margin-mobile py-24 md:px-margin-desktop">
        <h2 className="reveal mb-12 text-center font-headline-lg">Pertanyaan yang Sering Diajukan</h2>
        <div className="space-y-4">
          {[
            {
              q: "Apakah ini marketplace properti?",
              a: "Bukan. Kami tidak menyewakan atau menjual properti. Hunian adalah alat bantu (tools) untuk mengorganisir dan menganalisa pilihan properti yang sudah Anda temukan sendiri di platform lain seperti OLX, Rumah123, atau WhatsApp.",
            },
            {
              q: "Bagaimana AI membaca data saya?",
              a: "Anda hanya perlu copy-paste teks chat WhatsApp atau link listing ke platform kami. AI (LLM) akan membaca teks tersebut, mengekstrak informasi penting (harga, fasilitas, alamat), dan memasukkannya ke dalam tabel perbandingan yang rapi secara otomatis.",
            },
            {
              q: "Apakah data saya aman?",
              a: "Sangat aman. Data pencarian hunian Anda bersifat privat dan hanya digunakan untuk keperluan perbandingan di akun Anda sendiri. Kami tidak menjual data Anda kepada agen properti atau pihak ketiga mana pun.",
            },
          ].map((f) => (
            <details key={f.q} className="reveal group rounded-xl border border-outline-variant bg-surface-container-lowest [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer items-center justify-between gap-1.5 p-6 font-headline-md text-lg text-on-surface transition-colors hover:bg-surface-container-low">
                {f.q}
                <Icon name="expand_more" className="transition duration-300 group-open:-rotate-180" />
              </summary>
              <div className="px-6 pb-6 font-body-md text-on-surface-variant">{f.a}</div>
            </details>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-outline-variant bg-surface-container-lowest px-margin-mobile py-12 md:px-margin-desktop">
        <div className="mx-auto grid max-w-max-width grid-cols-1 items-center gap-8 md:grid-cols-2">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <Image alt="Hunian Logo" width={24} height={24} className="h-6 w-auto rounded-md opacity-80 grayscale" src="/icon.png" />
              <span className="font-headline-md text-[18px] font-bold text-primary">Hunian Decision Labs</span>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant">
              © 2026 Hunian Decision Labs. All rights reserved.
            </p>
          </div>
          <div className="flex flex-wrap gap-6 md:justify-end">
            <a className="font-body-md text-body-md text-on-surface-variant transition-colors hover:text-secondary" href="#">Privacy Policy</a>
            <a className="font-body-md text-body-md text-on-surface-variant transition-colors hover:text-secondary" href="#">Terms of Service</a>
            <a className="font-body-md text-body-md text-on-surface-variant transition-colors hover:text-secondary" href="#">Contact Support</a>
            <a className="font-body-md text-body-md text-on-surface-variant transition-colors hover:text-secondary" href="#">Careers</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
