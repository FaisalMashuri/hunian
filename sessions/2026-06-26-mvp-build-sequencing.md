# Sesi Debat — MVP Build Sequencing

**Tanggal:** 2026-06-26
**Topik:** Faisal mau membangun website Hunian dari `next-feature/mvp.md`. Tentukan (a) apakah scope MVP benar untuk dibangun sekarang, dan (b) urutan build / sequencing — slice mana yang dibangun pertama agar value inti cepat terbukti, dan apa yang aman ditunda. Plus rekomendasi tech stack.
**Agent terlibat:** PM · UX · STR · TL · DA · SYN · PO (7/7 selesai)
**Status PO:** UNCERTAIN → 🙋 AWAITING FAISAL
**Confidence:** MEDIUM

> Catatan: Sesi ini diselesaikan oleh ORCHESTRATOR dalam mode sinkron. Transcript penuh tiap agent ada di context orchestrator (write subagent diblokir izin); ringkasan terstruktur di bawah dipersist oleh main thread.

---

## SESSION CLOSE

```
Topik: MVP build sequencing + scope sanity + tech stack (website Hunian)
Total tasks: 7 | Completed: 7 (PM·UX·STR·TL·DA·SYN·PO) | Skipped: 0
Product Owner status: UNCERTAIN → AWAITING FAISAL
```

## Verdict Final (Synthesizer, di-gate PO)

Bangun **Slice 1 sebagai satu pipeline end-to-end tak-terpecah**:
Onboarding 3-step → Input form Kontrakan → AI extraction + pre-processing lokal → Property Review → Scoring 3 dimensi → Compare basic (≥2 kandidat) → pilih.

Ukur **session depth** sebagai metric Slice 1 (bukan cycle completion 60% — dead zone survei 7+ hari bikin tak terukur jujur tanpa re-engagement). Jadikan **benchmark akurasi AI extraction (>85% pada 20+ teks WA broker nyata)** sebagai gate GO/NO-GO sebelum Slice 2.

**Confidence: MEDIUM** — stack, scope, dan build-order solid; 2 ketidakpastian: akurasi extraction belum diuji, dan apakah session depth cukup predictive. Hampir semua keputusan reversible kecuali "Slice 1 = end-to-end".

## Resolusi Konflik Kunci

- **Build order (STR vs PM/TL):** DA membongkar STR — "membuktikan moat (Compare)" ≠ "membuktikan completion rate". Compare tanpa pipeline data nyata hanya menguji preferensi UI. Resolusi: keduanya benar tapi menjawab pertanyaan berbeda → satu slice end-to-end, Compare wajib di dalamnya, tidak dipecah.
- **Metric (UX + DA):** dead zone 7+ hari = fakta struktural. Turunkan ke session depth proxy.

## Keputusan Stack (diterima)

Next.js + Tailwind + shadcn/ui · Supabase (Postgres+Storage, RLS anon+auth, `scoring_version` per row) · GPT-4o mini (bersyarat benchmark) + pre-processing normalisasi lokal · Google Maps geocoding (Mapbox/OSM ditolak: transit Indonesia lemah; distance pakai input km manual dulu) · Vercel · auth anonymous-first. 2 moda transport aktif, schema siap 4. Effort ~19–26 hari solo.

## Dua Pertanyaan PO yang Menahan Output

1. **Apakah 10 pilot user pertama orang yang Faisal kenal personal DAN sedang aktif cari hunian sekarang?**
   - YA → dead zone bisa di-follow-up manual; metric bisa tetap cycle completion 60% (kasar).
   - TIDAK → pakai session depth proxy. *(Default bila tak dijawab: TIDAK.)*
2. **Apakah logika Deal Breaker (auto-eliminasi kandidat pelanggar) masuk Slice 1?** Menentukan seberapa berguna Compare pertama terasa. *(Default bila tak dijawab: sertakan deal-breaker flag minimal.)*

## Next Actions (owner: Faisal)

1. Jawab 2 pertanyaan PO — sebelum mulai coding.
2. Kumpulkan 20+ teks broker WA nyata → uji extraction GPT-4o mini → hitung field accuracy (gate Slice 2) — hari 1–3.
3. Setup Supabase schema (4-moda nullable, RLS anon+auth, `scoring_version`) — hari 1–2.
4. Build Slice 1 end-to-end — target 19–26 hari.
5. Pasang session-depth tracking + exit survey "apakah skor ini membantu memutuskan?" di Compare.
6. Review setelah ≥5 user selesai sesi, sebelum commit Slice 2.
