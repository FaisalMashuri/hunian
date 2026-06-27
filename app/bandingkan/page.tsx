import { redirect } from "next/navigation";
import { Suspense } from "react";
import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase/server";
import { CompareContent } from "./compare-content";
import { CompareSkeleton } from "./skeletons";

export default async function BandingkanPage({
  searchParams,
}: {
  searchParams: Promise<{ ids?: string }>;
}) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect("/login");

  const { ids: idsParam } = await searchParams;

  const { data: prefs } = await supabaseAdmin
    .from("user_preferences")
    .select("onboarding_completed, budget_ideal, budget_max, weight_harga, weight_lokasi, weight_fasilitas")
    .eq("user_id", userId)
    .maybeSingle();
  if (!prefs?.onboarding_completed) redirect("/onboarding");

  return (
    <Suspense fallback={<CompareSkeleton />}>
      <CompareContent
        userId={userId}
        idsParam={idsParam}
        budget={{ ideal: (prefs.budget_ideal as number) ?? null, max: (prefs.budget_max as number) ?? null }}
        weights={{
          harga: (prefs.weight_harga as number) ?? 0.34,
          lokasi: (prefs.weight_lokasi as number) ?? 0.33,
          fasilitas: (prefs.weight_fasilitas as number) ?? 0.33,
        }}
      />
    </Suspense>
  );
}
