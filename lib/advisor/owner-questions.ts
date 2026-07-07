import "server-only";
import OpenAI from "openai";

// AI advisor: menyusun DAFTAR PERTANYAAN untuk ditanyakan ke pemilik/agen saat survei.
// AI hanya membantu MENGINGATKAN apa yang perlu ditanya — tidak menilai/memutuskan (selaras FR-AI).

export type OwnerQuestionInput = {
  title: string;
  propertyType: string;
  hargaBulanan: number | null;
  deposit: number | null;
  periode: string | null;
  furnished: string | null;
  unknowns: string[]; // data yang masih belum diketahui (label)
  dealBreakers: string[]; // deal breaker aktif user (label)
};

export type QuestionGroup = { category: string; questions: string[] };

const SYS = `Kamu asisten survei properti sewa di Indonesia. Susun DAFTAR PERTANYAAN konkret yang wajib ditanyakan calon penyewa ke PEMILIK/agen saat survei langsung.
Fokus hal yang sering terlewat & berisiko: biaya tersembunyi (listrik/air/IPL/sampah/parkir), sistem & jadwal pembayaran, deposit + syarat pengembaliannya, minimal kontrak & kenaikan harga saat perpanjang, aturan (tamu menginap, pasutri, hewan, renovasi/paku), tanggung jawab perbaikan (siapa yang benahi kalau rusak), keamanan & lingkungan (banjir, tetangga, satpam), akses & parkir.
PRIORITAS: (1) data yang masih BELUM DIKETAHUI, (2) DEAL BREAKER yang diberikan user — buat pertanyaan yang mengonfirmasi hal itu.
Aturan: Bahasa Indonesia, tiap pertanyaan singkat & langsung (siap diucapkan), spesifik ke konteks hunian ini, jangan mengarang fakta. 4-6 kategori, tiap kategori 2-4 pertanyaan.
Balas HANYA JSON valid dengan bentuk: {"groups":[{"category":"...","questions":["...","..."]}]}`;

export async function suggestOwnerQuestions(input: OwnerQuestionInput): Promise<QuestionGroup[]> {
  const client = new OpenAI();
  const res = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    temperature: 0.4,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYS },
      { role: "user", content: `Konteks hunian (JSON):\n${JSON.stringify(input)}\n\nSusun pertanyaannya.` },
    ],
  });
  const raw = res.choices[0]?.message?.content?.trim() ?? "{}";
  const parsed = JSON.parse(raw) as { groups?: QuestionGroup[] };
  return (parsed.groups ?? []).filter(
    (g) => g && typeof g.category === "string" && Array.isArray(g.questions) && g.questions.length > 0,
  );
}
