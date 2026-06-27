import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase/server";
import { OnboardingFlow } from "./onboarding-flow";

// Gate via server component + query DB (bukan flag JWT — hindari staleness).
export default async function OnboardingPage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect("/login");

  const { data } = await supabaseAdmin
    .from("user_preferences")
    .select("onboarding_completed")
    .eq("user_id", userId)
    .maybeSingle();

  if (data?.onboarding_completed) redirect("/dashboard");

  return <OnboardingFlow />;
}
