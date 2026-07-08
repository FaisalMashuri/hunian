# OPTIO — Product Philosophy

> Dokumen filosofi produk — **manifesto, prinsip, decision framework, litmus test, anti-goals, North Star**.
> Bagian dari 3 dokumen: **Brand Foundation** (`BRAND-FOUNDATION.md`) · **Product Philosophy** (ini) · **Go-to-Market** (`GO-TO-MARKET.md`).
>
> Dokumen ini menjawab satu pertanyaan: *"Kalau besok ada ide fitur baru, bagaimana kita tahu fitur itu masih sesuai identitas produk?"*

---

## Peran AI: penasihat, bukan hakim

Peran AI di Optio punya **tiga lapis**, dan keputusan akhir tetap milik user:

1. **Mengurangi mengetik** — ekstrak teks listing berantakan jadi data terstruktur.
2. **Menyajikan fakta** — menormalkan & memverifikasi apa yang benar tentang tiap hunian.
3. **Memberi skor** — menimbang fakta jadi angka yang bisa dibandingkan.
4. **Vonis akhir di tangan user** — AI menyodorkan bukti + timbangan, manusia yang mengetuk palu.

Model mental: **AI menyiapkan perkaranya — kamu yang mengetuk palu.**

---

## Manifesto Optio ⭐ (kompas internal)

> **Kami tidak memilihkan untukmu.
> Kami membantu kamu memahami setiap pilihan sehingga keputusan benar-benar berasal dari dirimu.**

Ini bukan sekadar brand promise — ini **kompas produk**. Aset paling berharga di seluruh dokumen, karena ia memberi arah untuk setiap keputusan produk di masa depan.

### The Litmus Test — setiap fitur baru wajib lolos satu pertanyaan:

> *"Apakah fitur ini membantu pengguna mengambil keputusan yang lebih baik — atau justru mengambil keputusan untuk mereka?"*

- **Membantu memahami** → sejalan dengan Optio. ✅
- **Mengambil alih keputusan** → bukan Optio, seberapa pun canggihnya. ❌

Berlaku selamanya — dari hari ini sampai saat tim sudah berisi 50 engineer, 20 designer, dan 10 AI engineer.

> Bedakan: **Manifesto Optio** (ini) = *kompas internal*. **The Decision Manifesto** (di bawah) = *copy publik* halaman `/manifesto`.

---

## The Decision Manifesto
*Copy publik — halaman `/manifesto`.*

> Kita hidup di zaman yang penuh pilihan.
> Tetapi semakin banyak pilihan, semakin sulit mengambil keputusan.
> Bukan karena kita kurang informasi — justru karena informasi terlalu banyak.
>
> Memilih hunian tidak seharusnya bergantung pada ingatan.
> Atau screenshot. Atau feeling.
> Keputusan penting layak dibuat dengan informasi yang jelas.
>
> AI seharusnya membantu manusia **berpikir** —
> bukan menggantikan manusia berpikir.
>
> Karena itu kami membangun Optio.
>
> **Kami tidak memilihkan.
> Kami membantu kamu memilih dengan lebih yakin.**

---

## Core Principles

- **Clarity** — Informasi harus mudah dipahami. Bukan semakin rumit.
- **Transparency** — Semua skor harus bisa dijelaskan. Tidak ada "AI bilang begini" tanpa alasan.
- **User First** — AI membantu. User memutuskan.
- **Trust** — Kami tidak menjual listing. Kami membantu memilih.

## Design Principles

Pegangan untuk setiap keputusan desain & interaksi produk.

- **Explain every score** — Semua skor harus memiliki alasan. Angka tanpa penjelasan tidak boleh muncul.
- **No black box** — AI boleh pintar. Tetapi pengguna harus tahu **mengapa** hasilnya seperti itu.
- **Human in control** — AI memberi rekomendasi. Pengguna membuat keputusan.
- **Simple first** — Lebih baik sederhana tetapi dipahami, daripada pintar tetapi membingungkan.

## The Optio Principles

Empat prinsip yang harus selalu diingat tim.

1. **Clarity before confidence** — Kejelasan datang lebih dulu. Kepercayaan diri mengikuti.
2. **Facts before opinions** — Fakta lebih penting daripada asumsi.
3. **Compare before deciding** — Jangan memilih sebelum membandingkan.
4. **People decide** — AI membantu. Manusia memutuskan.

---

## The Decision Framework

Optio selalu menuntun pengguna lewat empat tahap yang sama. Bisa menjadi flow UI utama.

```
Observe  →  Understand  →  Compare  →  Decide
(amati)     (pahami)       (banding)   (putuskan)
```

- **Observe** — kumpulkan listing dari mana pun, apa adanya.
- **Understand** — AI merapikan jadi fakta yang jelas & bisa dijelaskan.
- **Compare** — semua kandidat berdampingan dalam satu layar.
- **Decide** — pengguna mengambil keputusan, dengan yakin.

---

## Anti-Goals

Hal-hal yang **sengaja kami hindari**, agar tim tidak kehilangan arah saat produk tumbuh.

**Kami tidak ingin menjadi:**
- marketplace,
- broker,
- portal listing,
- mesin rekomendasi yang mengambil keputusan,
- platform iklan properti.

Setiap kali sebuah ide mendekatkan Optio ke salah satu dari ini, berhenti dan tanyakan ulang Litmus Test.

---

## North Star

Satu metrik utama — **bukan** MAU/DAU, karena keduanya mengukur perhatian, bukan nilai yang kami janjikan.

> **North Star: Decision Completed** — jumlah keputusan yang berhasil dibantu (perbandingan yang diselesaikan sampai pengguna memilih).

Metrik ini setia pada filosofi: kami berhasil bukan saat orang membuka aplikasi, tetapi saat mereka **memutuskan dengan lebih yakin**. Semua metrik Go-to-Market sebaiknya mengalir dari sini (lihat `GO-TO-MARKET.md`).

---

## Cakupan jangka panjang: Decision Engine

Yang sebenarnya kami bangun bukan produk *hunian*. Kami membangun mesin untuk **keputusan besar (high-stakes decisions)** — dan kebetulan memulainya dari hunian.

Hunian hari ini. Besok bisa: **mobil, sekolah, laptop, asuransi, KPR.** Semua punya pola yang sama: informasi berantakan dari banyak sumber, pilihan yang sulit dibandingkan, keputusan yang bikin cemas. Dan filosofinya identik: **AI membantu, user memutuskan.**

**Ini BUKAN ajakan pivot sekarang.** Fokus tetap: menangkan hunian, satu ICP, sampai tuntas. Tapi bangun dari awal sebagai **decision engine yang dimulai dari hunian** — arsitektur, bahasa (lihat *Decision Lexicon*), dan prinsip yang tidak terkunci hanya pada properti. Kalau lima tahun lagi lahir **Optio Car / School / Insurance**, filosofinya tidak perlu berubah sedikit pun.

> Uji setiap keputusan arsitektur: *"Apakah ini mengunci kita hanya ke hunian, atau tetap berlaku untuk keputusan besar apa pun?"* Pilih yang kedua bila biayanya kecil.
