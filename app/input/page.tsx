import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase/server";
import { InputFlow } from "./input-flow";

export default async function InputPage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect("/login");

  const { data: prefs } = await supabaseAdmin
    .from("user_preferences")
    .select("onboarding_completed")
    .eq("user_id", userId)
    .maybeSingle();
  if (!prefs?.onboarding_completed) redirect("/onboarding");

  // Wizard fokus (lepas dari AppShell/sidebar) — topnav + stepper di dalam InputFlow, konsisten dgn detail page.
  return <InputFlow />;
}
