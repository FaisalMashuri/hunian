---
name: feedback-subagent-orchestration
description: Pelajaran menjalankan sub-agent Hunian secara sinkron — truncation notifikasi, SendMessage tak tersedia, agent-memory writable
metadata:
  type: feedback
---

Saat menjalankan agent team Hunian (UX/PM/TL/DA/SYN/PO) secara sinkron via Agent tool, tiga hal mempengaruhi cara kerja:

1. **Output sub-agent yang panjang bisa terpotong di notifikasi penyelesaian** — bagian DEPAN hilang, hanya bagian akhir yang sampai. Contoh nyata: UX (primary) menghasilkan IA + Layar 1-8; notifikasi hanya membawa Layar 6-8 + design direction.
2. **Tool `SendMessage` TIDAK tersedia** di environment ini (bukan deferred tool; ToolSearch tak menemukannya). Jadi sub-agent yang sudah selesai TIDAK bisa di-resume. Untuk mengambil bagian yang hilang, **spawn agent terfokus baru** dan berikan inline semua keputusan yang sudah terkunci agar konsisten.
3. **Sub-agent BISA menulis ke `.claude/agent-memory/<agent>/`** (DA & SYN berhasil) — bertentangan dengan catatan lama "subagent tidak bisa menulis ke disk". Yang diblokir adalah Write ke path proyek umum; agent-memory writable. Manfaatkan: minta agent simpan output penuh ke memory-nya, lalu Orchestrator baca dari sana bila notifikasi terpotong.

**Why:** Mencegah kehilangan konten deliverable saat sesi panjang, dan menghindari menunggu/berhenti karena agent tak bisa di-resume.

**How to apply:** (a) Untuk deliverable besar, instruksikan sub-agent menulis hasil penuh ke `agent-memory`-nya sebagai backup, ATAU pecah permintaan agar tiap output muat. (b) Bila notifikasi terpotong, baca file memory agent tersebut (bukan output JSONL transcript yang dilarang dibaca), atau spawn agent pelengkap dengan konteks terkunci inline. (c) Edit/Write file proyek dari main-thread sering minta Read ulang sebelum Edit — baca dulu file kecil sebelum mengedit. Lihat [[project-hunian-uiux-slice1]] untuk konteks sesi.
