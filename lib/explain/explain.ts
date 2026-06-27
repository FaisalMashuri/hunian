import "server-only";
import OpenAI from "openai";

// AI MENJELASKAN skor yang sudah dihitung rule — TIDAK menghitung/mengubah skor (FR-SC-3).
export type ExplainInput = {
  title: string;
  scoreTotal: number | null;
  scoreHarga: number | null;
  scoreLokasi: number | null;
  scoreFasilitas: number | null;
  harga: number | null;
  budgetIdeal: number | null;
  budgetMax: number | null;
  distanceKm: number | null;
  furnished: string | null;
  carport: boolean | null;
  dapur: boolean | null;
  unknowns: string[];
};

const SYS = `Kamu asisten yang MENJELASKAN skor sebuah hunian sewa. Skor SUDAH dihitung oleh sistem rule-based — kamu TIDAK menghitung ulang dan TIDAK mengubah angka.
Gaya: bahasa Indonesia, ramah seperti teman, ringkas (maks ~5 kalimat).
Struktur: 1-2 kalimat faktor pendukung utama (kenapa skornya segitu), lalu bila ada data hilang, satu baris diawali "Yang belum diketahui:" dengan daftar singkat. Jangan membuat klaim di luar data yang diberikan.`;

export async function explainCandidate(input: ExplainInput): Promise<string> {
  const client = new OpenAI();
  const res = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    temperature: 0.3,
    messages: [
      { role: "system", content: SYS },
      { role: "user", content: `Data & skor (JSON):\n${JSON.stringify(input)}\n\nJelaskan skornya.` },
    ],
  });
  return res.choices[0]?.message?.content?.trim() ?? "Penjelasan tidak tersedia.";
}
