---
name: orchestration-mechanics
description: Mekanik menjalankan agent team Hunian di environment ini (async-notify, persist, Write-after-Read)
metadata:
  type: feedback
---

Cara menjalankan sub-agent Hunian secara sinkron di environment ini.

**Why:** Definisi Orchestrator menuntut eksekusi SINKRON (blocking tiap wave). Tapi tool Agent di sini melepas agent secara async/background, lalu mengirim `task-notification` saat agent selesai — dan notifikasi itu MEME-resume Orchestrator di giliran berikutnya. Jadi "spawn lalu tunggu notifikasi" = setara blocking dan AMAN di sini (berbeda dari catatan lama di `hunian-team-context.md` yang bilang harness tak bisa resume). `SendMessage` untuk melanjutkan agent yang sama TIDAK tersedia sebagai tool → untuk ronde revisi, spawn agent baru dengan konteks lengkap.

**How to apply:**
- Spawn satu wave (boleh paralel dalam satu pesan), akhiri giliran dengan pesan singkat "menunggu", lalu lanjut saat notifikasi tiap agent masuk. Jangan anggap selesai sebelum semua agent wave itu notif.
- Output subagent bisa terpotong di hasil yang dikembalikan (pernah hanya paruh kedua DDL). Mitigasi: minta output ringkas-komentar, atau pecah jadi ronde; Orchestrator merekonstruksi bagian hilang saat konsolidasi.
- Subagent TIDAK bisa menulis ke disk (Write/Bash diblokir izin). Main-thread/Orchestrator yang mempersist semua artefak.
- Write tool: untuk file yang SUDAH ADA (mis. `_INDEX.md`, checkpoint, team-context), WAJIB Read dulu di percakapan ini sebelum Edit/Write walau isinya sudah pernah dilihat via Bash `cat`. File baru boleh langsung Write.
- Persist artefak akhir tiap sesi: `docs/`, `db/`, `next-feature/<slug>.md` (dari `next-feature/TEMPLATE.md`), `next-feature/_INDEX.md`, `.claude/hunian-team-context.md`, `sessions/<tanggal>-<topik>.md`, `.claude/hunian-checkpoint.json`.
