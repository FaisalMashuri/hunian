# Agent Team Limitations — Handling Protocol

Claude Code agent teams adalah fitur experimental. File ini mendokumentasikan setiap limitasi yang diketahui dan protocol konkret untuk mengatasinya dalam konteks Hunian agent team.

Referensi: https://code.claude.com/docs/en/agent-teams#limitations

---

## Limitasi 1: No Session Resumption

**Apa masalahnya:**
`/resume` dan `/rewind` tidak merestore in-process teammates. Setelah session interrupted dan di-resume, Lead akan mencoba message teammate yang sudah tidak ada lagi.

**Dampak ke Hunian team:**
Kalau sesi debat terputus di tengah jalan, progress agent yang sedang berjalan hilang. Orchestrator akan kehilangan track siapa sudah mengerjakan apa.

**Protocol:**

### Checkpoint setelah setiap agent selesai

Orchestrator WAJIB menulis checkpoint file setiap kali satu agent menyelesaikan task-nya:

```
.claude/hunian-checkpoint.json
```

Format checkpoint:
```json
{
  "session_id": "YYYY-MM-DD-[topic-slug]",
  "topic": "[topik sesi]",
  "started_at": "YYYY-MM-DDTHH:MM:SS",
  "last_updated": "YYYY-MM-DDTHH:MM:SS",
  "tasks": {
    "T-001": { "agent": "UX", "status": "done", "output_ref": "T-001-ux.md" },
    "T-002": { "agent": "TL", "status": "done", "output_ref": "T-002-tl.md" },
    "T-003": { "agent": "STR", "status": "in_progress", "output_ref": null },
    "T-004": { "agent": "DA", "status": "pending", "output_ref": null },
    "T-005": { "agent": "SYN", "status": "pending", "output_ref": null },
    "T-006": { "agent": "PO", "status": "pending", "output_ref": null }
  },
  "completed_agents": ["PM", "UX", "TL"],
  "pending_agents": ["STR", "DA", "SYN", "PO"],
  "feature_file": "next-feature/[feature-slug].md"
}
```

Setiap output agent sementara disimpan di:
```
.claude/session-outputs/[session-id]/T-00X-[agent].md
```

### Cara recovery setelah session interrupted

1. Buka checkpoint: `cat .claude/hunian-checkpoint.json`
2. Lihat `completed_agents` — output mereka sudah tersimpan di `.claude/session-outputs/`
3. Spawn ulang hanya agent yang belum selesai (`pending_agents`)
4. Pass output dari completed agents ke agent baru sebagai context
5. Lanjutkan dari titik terputus

**Instruksi ke Orchestrator setelah resume:**
```
Sesi sebelumnya terputus. Baca checkpoint di .claude/hunian-checkpoint.json.
Load output yang sudah ada dari .claude/session-outputs/[session-id]/.
Spawn hanya agent yang belum menyelesaikan task mereka dan lanjutkan dari sana.
```

---

## Limitasi 2: Task Status Can Lag

**Apa masalahnya:**
Teammate kadang tidak mark task sebagai completed, sehingga task yang depend padanya tetap blocked padahal pekerjaannya sudah selesai.

**Dampak ke Hunian team:**
Sesi bisa stuck padahal semua agent sudah selesai bekerja. Orchestrator menunggu status update yang tidak datang.

**Protocol:**

### Timeout check per task

Orchestrator menerapkan timeout per task: jika task tidak berubah status dalam **5 menit** setelah agent seharusnya selesai, Orchestrator melakukan manual check:

```
[ORCHESTRATOR: TASK STATUS CHECK]
T-00X belum marked as done. Mengecek secara manual.

→ Apakah [agent] sudah selesai? Jika ya, mark T-00X sebagai done secara manual.
→ Jika belum selesai, tanya ke [agent]: apa yang blocking?
```

### Manual override command

Kalau Faisal melihat task stuck:
```
Mark T-00X sebagai selesai. Output dari [agent] ada di .claude/session-outputs/[session-id]/T-00X-[agent].md
Lanjutkan ke task berikutnya.
```

### Prevention: explicit done signal

Setiap agent wajib mengakhiri outputnya dengan:
```
[AGENT NAME: TASK T-00X COMPLETE]
Output tersimpan di: .claude/session-outputs/[session-id]/T-00X-[agent].md
Siap untuk task berikutnya atau dapat di-shutdown.
```

---

## Limitasi 3: Shutdown Can Be Slow

**Apa masalahnya:**
Teammate menyelesaikan request atau tool call yang sedang berjalan sebelum shutdown, yang bisa memakan waktu.

**Dampak ke Hunian team:**
Kalau ada 5-6 agent aktif dan kamu ingin menghentikan sesi, mungkin butuh waktu beberapa menit sebelum semuanya benar-benar berhenti.

**Protocol:**

### Graceful shutdown sequence

Jangan interrupt semua agent sekaligus. Ikuti urutan ini:

1. **Hentikan agent yang paling awal di pipeline dulu** (PM, UX — yang sudah tidak aktif)
2. **Tunggu agent yang sedang aktif selesai dengan task mereka** sebelum interrupt
3. **Beritahu Lead** untuk tidak spawn task baru saat shutdown:
   ```
   Hunian team: masuk ke shutdown mode. 
   Jangan spawn task baru.
   Selesaikan task yang sedang berjalan, lalu shutdown berurutan mulai dari agent yang sudah idle.
   ```
4. **Pastikan checkpoint dan output tersimpan** sebelum shutdown final

### Emergency shutdown (kalau stuck)

Jika agent tidak merespon dalam waktu lama:
```bash
# List semua tmux sessions
tmux ls

# Kill session specific
tmux kill-session -t <session-name>
```

Setelah ini, checkpoint yang ada masih bisa dipakai untuk resume.

---

## Limitasi 4: No Nested Teams

**Apa masalahnya:**
Teammate tidak bisa spawn teammate lain. Hanya Lead (Orchestrator) yang bisa manage team.

**Dampak ke Hunian team:**
Dalam desain kita, semua agent di-spawn oleh Orchestrator. Ini tidak jadi masalah karena kita sudah design Orchestrator sebagai satu-satunya yang spawn agent.

**Apa yang TIDAK boleh dilakukan:**
- Jangan instruksikan agent PM/UX/TL untuk spawn sub-agent sendiri
- Jangan design task yang mengharuskan agent berkomunikasi langsung untuk spawn agent baru

**Workaround jika butuh "sub-research":**
Jika satu task butuh investigasi lebih dalam, Orchestrator yang spawn agent tambahan, bukan agent yang sedang berjalan:
```
[ORCHESTRATOR: ADDITIONAL AGENT NEEDED]
T-003 dari TL membutuhkan investigasi lebih dalam tentang Dexie.js sync.
Spawning additional TL instance dengan context dari T-003.
```

---

## Limitasi 5: One Team Per Session

**Apa masalahnya:**
Satu session hanya bisa punya satu team. Tidak bisa share team across sessions.

**Dampak ke Hunian team:**
Setiap kali kamu mulai sesi Claude Code baru, itu sesi baru dengan team baru. History dari team sebelumnya tidak carry over secara otomatis.

**Protocol:**

### Sebelum mulai sesi baru

Pastikan session sebelumnya menghasilkan:
1. ✅ Feature file di `next-feature/[feature-slug].md` — sudah complete
2. ✅ `_INDEX.md` sudah di-update
3. ✅ `sessions/[tanggal]-[topik].md` sudah tersimpan

### Context passing ke sesi baru

Saat mulai sesi baru, berikan Orchestrator context ini:
```
Baca next-feature/_INDEX.md untuk melihat semua fitur yang sudah pernah didiskusikan.
Baca sessions/ folder untuk melihat history debat sebelumnya.
Baca .claude/hunian-checkpoint.json kalau ada sesi yang belum selesai.
```

### Continuous context file

Maintain satu file yang selalu up-to-date sebagai "memory" lintas sesi:

```
.claude/hunian-team-context.md
```

Format:
```markdown
# Hunian Team — Continuous Context

Last updated: YYYY-MM-DD

## Keputusan yang sudah pernah dibuat
- [keputusan 1] — tanggal — session ref
- [keputusan 2] — tanggal — session ref

## Prinsip yang sudah dikonfirmasi Faisal
- [prinsip 1]
- [prinsip 2]

## Features yang sudah di-reject (jangan usulkan ulang)
- [feature] — alasan — kondisi untuk reconsider

## Open questions dari sesi sebelumnya
- [pertanyaan] — assigned ke: [siapa] — by: [kapan]
```

Orchestrator WAJIB membaca file ini di awal setiap sesi sebelum spawn agent apapun.

---

## Quick Reference — Limitasi & Solusi

| Limitasi | Solusi Utama | File/Command |
|---|---|---|
| Session tidak bisa resume | Checkpoint setelah tiap agent | `.claude/hunian-checkpoint.json` |
| Task status lag | Timeout check + manual override | `Mark T-00X sebagai selesai` |
| Shutdown lambat | Graceful sequence, idle-first | `tmux kill-session` untuk emergency |
| No nested teams | Orchestrator saja yang spawn | Design task tanpa sub-spawning |
| One team per session | Continuous context file | `.claude/hunian-team-context.md` |

---

## Monitoring Checklist per Sesi

Gunakan ini selama sesi berlangsung:

```
[ ] Checkpoint file dibuat saat sesi mulai
[ ] Output setiap agent disimpan ke .claude/session-outputs/
[ ] Tidak ada task yang stuck > 5 menit
[ ] Sebelum shutdown: semua output sudah tersimpan
[ ] Feature file sudah di-write ke next-feature/
[ ] _INDEX.md sudah di-update
[ ] hunian-team-context.md sudah di-update
```