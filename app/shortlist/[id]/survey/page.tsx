import { redirect, notFound } from "next/navigation";
import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase/server";
import { SurveyClient, type SurveyInitial } from "./survey-client";
import { loadCandidatePhotos } from "@/lib/photos";
import type { FurnishedStatus } from "@/lib/types/db";

export default async function SurveyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect("/login");

  const { data: c } = await supabaseAdmin
    .from("candidates")
    .select(
      "title, kamar_tidur, kamar_mandi, furnished, carport, dapur, luas_bangunan_m2, deposit, alamat, biaya_ipl, kontak_owner",
    )
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();
  if (!c) notFound();

  // Kolom numerik S2-5 — query terpisah & toleran (bila migration S2-5 belum dijalankan, kolom belum ada).
  let listrikNominal: number | null = null;
  let airNominal: number | null = null;
  const { data: bn } = await supabaseAdmin
    .from("candidates")
    .select("biaya_listrik_nominal, biaya_air_nominal")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();
  if (bn) {
    listrikNominal = (bn.biaya_listrik_nominal as number | null) ?? null;
    airNominal = (bn.biaya_air_nominal as number | null) ?? null;
  }

  // Foto survei yang sudah ada (S2-1) — ditampilkan & bisa ditambah saat survei.
  const { survey: surveyPhotos } = await loadCandidatePhotos(id);

  const { data: s } = await supabaseAdmin
    .from("candidate_surveys")
    .select("*")
    .eq("candidate_id", id)
    .maybeSingle();

  const initial: SurveyInitial = {
    id,
    title: (c.title as string) ?? "Hunian",
    current: {
      kamar_tidur: (c.kamar_tidur as number | null) ?? null,
      kamar_mandi: (c.kamar_mandi as number | null) ?? null,
      furnished: (c.furnished as FurnishedStatus | null) ?? null,
      carport: (c.carport as boolean | null) ?? null,
      dapur: (c.dapur as boolean | null) ?? null,
      luas_bangunan_m2: (c.luas_bangunan_m2 as number | null) ?? null,
      deposit: (c.deposit as number | null) ?? null,
      alamat: (c.alamat as string | null) ?? null,
      biaya_listrik_nominal: listrikNominal,
      biaya_air_nominal: airNominal,
      biaya_ipl: (c.biaya_ipl as number | null) ?? null,
      kontak_owner: (c.kontak_owner as string | null) ?? null,
    },
    survey: s
      ? {
          ratings: {
            kebersihan: (s.kebersihan_rating as number | null) ?? null,
            kebisingan: (s.kebisingan_rating as number | null) ?? null,
            parkir: (s.parkir_rating as number | null) ?? null,
            owner: (s.owner_rating as number | null) ?? null,
            keamanan: (s.keamanan_rating as number | null) ?? null,
            kondisi_bangunan: (s.kondisi_bangunan_rating as number | null) ?? null,
          },
          tags: {
            kebersihan: (s.kebersihan_tags as string[] | null) ?? [],
            kebisingan: (s.kebisingan_tags as string[] | null) ?? [],
            parkir: (s.parkir_tags as string[] | null) ?? [],
            owner: (s.owner_tags as string[] | null) ?? [],
            keamanan: (s.keamanan_tags as string[] | null) ?? [],
            kondisi_bangunan: (s.kondisi_bangunan_tags as string[] | null) ?? [],
          },
          catatan: (s.catatan_survey as string | null) ?? null,
        }
      : null,
    photos: surveyPhotos,
  };

  return <SurveyClient initial={initial} />;
}
