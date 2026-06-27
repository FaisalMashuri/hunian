import { redirect, notFound } from "next/navigation";
import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase/server";
import { EditCandidate } from "./edit-client";
import type { ExtractedDraft } from "@/lib/extraction/types";
import type { FurnishedStatus, PropertyType } from "@/lib/types/db";
import type { Periode } from "@/lib/constants/periode";
import type { TypeData } from "@/app/input/type-specific";
import { asliFromPerBulan } from "@/lib/pricing";

export default async function EditCandidatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect("/login");

  const { data: c } = await supabaseAdmin
    .from("candidates")
    .select(
      "title, harga_sewa_bulanan, periode_asli, deposit, kamar_tidur, kamar_mandi, luas_bangunan_m2, furnished, carport, dapur, alamat, kontak_owner, deskripsi, property_type, type_specific_data",
    )
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();
  if (!c) notFound();

  const periode = (c.periode_asli as Periode | null) ?? null;
  const perBulan = (c.harga_sewa_bulanan as number) ?? null;
  const initial: ExtractedDraft = {
    title: (c.title as string) ?? null,
    harga_asli: perBulan == null ? null : asliFromPerBulan(perBulan, periode),
    harga_sewa_bulanan: perBulan,
    periode_asli: periode,
    deposit: (c.deposit as number) ?? null,
    kamar_tidur: (c.kamar_tidur as number) ?? null,
    kamar_mandi: (c.kamar_mandi as number) ?? null,
    luas_bangunan_m2: (c.luas_bangunan_m2 as number) ?? null,
    furnished: (c.furnished as FurnishedStatus | null) ?? null,
    carport: (c.carport as boolean | null) ?? null,
    dapur: (c.dapur as boolean | null) ?? null,
    alamat: (c.alamat as string) ?? null,
    kontak_owner: (c.kontak_owner as string) ?? null,
    deskripsi: (c.deskripsi as string) ?? null,
  };

  const propertyType = ((c.property_type as PropertyType) ?? "kontrakan");
  const typeData = ((c.type_specific_data as TypeData | null) ?? {});

  // Wizard fokus (lepas AppShell/sidebar) — selaras /input & detail page.
  return <EditCandidate id={id} initial={initial} propertyType={propertyType} typeData={typeData} />;
}
