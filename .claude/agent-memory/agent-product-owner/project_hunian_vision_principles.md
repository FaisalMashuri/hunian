---
name: project-hunian-vision-principles
description: Prinsip inti Hunian yang tidak boleh dilanggar — dari Vision Document dan MVP spec
metadata:
  type: project
---

Hunian adalah decision tool, bukan marketplace. Membantu user Indonesia memutuskan hunian dari kandidat yang mereka kumpulkan sendiri.

**Why:** Prinsip ini membedakan Hunian dari Mamikos clone. Faisal sangat eksplisit soal ini.

**Prinsip inti yang tidak boleh dilanggar:**
1. "AI bertugas mengurangi pekerjaan mengetik, bukan mengambil keputusan." — prinsip #1 dari MVP spec
2. User harus merasa in control atas datanya sendiri
3. Offline-first bukan optional — komitmen arsitektural (note: belum jelas apakah ini berlaku untuk web MVP atau hanya future mobile)
4. Simplicity over cleverness — kalau perlu dijelaskan cara pakainya, berarti terlalu kompleks
5. Hunian tidak boleh terasa seperti marketplace — ini tools, bukan platform listing

**Hero feature:** Compare trade-off forward — bukan ranking angka, tapi "trade-off apa yang kamu setujui?"

**North star metric:** Cycle completion rate — berapa persen user aktif mencari berhasil dari input kandidat pertama sampai memilih satu. Target awal 60%.

**Batasan yang sudah ditetapkan:**
- Solo developer / tim sangat kecil — complexity budget terbatas
- Early stage — validasi dulu sebelum scale
- Lebih suka build yang bisa divalidasi dalam 2 minggu daripada 2 bulan
- Monetisasi tidak boleh mengorbankan trust user

**Scoring:** Rule-based, BUKAN AI. Formula MVP: 30% harga, 20% lokasi, 20% kondisi, 15% fasilitas, 15% owner. AI hanya untuk extraction, normalization, dan explanation dari score yang sudah dihitung rule.

**How to apply:** Setiap kali Synthesizer merekomendasikan sesuatu yang melibatkan AI dalam decision-making, perubahan pada Compare flow, atau perubahan pada cara user menyimpan/mengakses data — flag dan konfirmasi ke Faisal.

Related: [[project-slice1-decisions]]
