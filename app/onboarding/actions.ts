"use server";

import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase/server";
import type { TransportMode } from "@/lib/types/db";
import { computeWeights } from "./options";

export type OnboardingInput = {
  budgetIdeal: number;
  budgetMax: number;
  tujuan: string;
  transportModes: TransportMode[];
  priorities: string[]; // dimensi: "harga" | "lokasi" | "fasilitas"
  dealBreakers: string[]; // slug preset
};

export type SaveResult = { ok: true } | { ok: false; error: string };

export async function saveOnboarding(input: OnboardingInput): Promise<SaveResult> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { ok: false, error: "Sesi berakhir. Masuk lagi." };
  if (input.priorities.length === 0) return { ok: false, error: "Prioritas wajib dipilih minimal satu." };

  const w = computeWeights(input.priorities);

  const { error: prefErr } = await supabaseAdmin.from("user_preferences").upsert(
    {
      user_id: userId,
      budget_ideal: input.budgetIdeal,
      budget_max: input.budgetMax,
      dest_address: input.tujuan.trim() || null,
      transport_modes: input.transportModes,
      priority_selection: input.priorities,
      weight_harga: w.harga,
      weight_lokasi: w.lokasi,
      weight_fasilitas: w.fasilitas,
      weight_keamanan: w.kondisi, // kolom legacy ← dimensi "Kondisi"
      weight_owner: w.owner,
      bobot_source: "user-defined",
      onboarding_completed: true,
    },
    { onConflict: "user_id" },
  );
  if (prefErr) {
    // FK violation user_id → baris `users` sesi sudah basi (mis. DB di-reset, cookie JWT lama).
    // Ubah pesan kriptik jadi arahan jelas: keluar lalu masuk lagi (jwt callback re-upsert users).
    if (prefErr.code === "23503" || /user_id_fkey/.test(prefErr.message)) {
      return { ok: false, error: "Sesimu sudah kedaluwarsa (akun belum tersinkron). Keluar lalu masuk lagi, lalu ulangi." };
    }
    return { ok: false, error: `Gagal menyimpan preferensi: ${prefErr.message}` };
  }

  // Deal breaker: ganti total (idempotent).
  await supabaseAdmin.from("user_deal_breakers").delete().eq("user_id", userId);
  if (input.dealBreakers.length > 0) {
    const rows = input.dealBreakers.map((key) => ({
      user_id: userId,
      deal_breaker_key: key,
      is_active: true,
    }));
    const { error: dbErr } = await supabaseAdmin.from("user_deal_breakers").insert(rows);
    if (dbErr) return { ok: false, error: `Gagal menyimpan deal breaker: ${dbErr.message}` };
  }

  return { ok: true };
}

export type Prediction = {
  description: string;
  placeId: string;
  mainText: string;
  secondaryText: string;
};

// Places Autocomplete (server-side; key tak terekspos ke browser). Region Indonesia.
export async function placesAutocompleteAction(query: string): Promise<Prediction[]> {
  const session = await auth();
  if (!session?.user?.id) return [];

  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key || query.trim().length < 3) return [];

  const url = new URL("https://maps.googleapis.com/maps/api/place/autocomplete/json");
  url.searchParams.set("input", query);
  url.searchParams.set("components", "country:id");
  url.searchParams.set("language", "id");
  url.searchParams.set("key", key);

  try {
    const res = await fetch(url.toString(), { cache: "no-store" });
    const data = (await res.json()) as {
      status?: string;
      predictions?: {
        description: string;
        place_id: string;
        structured_formatting?: { main_text?: string; secondary_text?: string };
      }[];
    };
    if (data.status !== "OK") return [];
    return (data.predictions ?? []).slice(0, 5).map((p) => ({
      description: p.description,
      placeId: p.place_id,
      mainText: p.structured_formatting?.main_text ?? p.description,
      secondaryText: p.structured_formatting?.secondary_text ?? "",
    }));
  } catch {
    return [];
  }
}
