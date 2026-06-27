import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { signIn, auth } from "@/auth";

export const metadata: Metadata = {
  title: "Masuk ke Hunian — mulai bandingkan hunian sewa",
  description:
    "Masuk dengan Google untuk mulai mengumpulkan, menskor, dan membandingkan pilihan hunian sewamu. Gratis.",
  alternates: { canonical: "/login" },
};

export default async function LoginPage() {
  const session = await auth();
  if (session?.user?.id) redirect("/dashboard");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-stone-50 p-6">
      <div className="w-full max-w-sm space-y-8">
        <Link href="/" className="block text-center text-lg font-bold tracking-tight text-zinc-900">
          Hunian<span className="text-teal-700">.</span>
        </Link>

        <div className="rounded-2xl border border-zinc-200 bg-white p-7 text-center shadow-sm">
          <h1 className="text-xl font-bold tracking-tight text-zinc-900">
            Masuk untuk mulai bandingkan — gratis sepenuhnya
          </h1>
          <p className="mt-2 text-sm text-zinc-600">
            Daftar shortlist dan preferensimu tersimpan supaya bisa dilanjutkan kapan saja.
          </p>

          <form
            className="mt-6"
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: "/dashboard" });
            }}
          >
            <button
              type="submit"
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-800 transition-colors hover:bg-zinc-50"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09Z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.98.66-2.24 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.11a6.6 6.6 0 0 1 0-4.22V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.84Z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z"
                />
              </svg>
              Masuk dengan Google
            </button>
          </form>

          <p className="mt-4 text-xs text-zinc-500">Gratis sepenuhnya. Tidak perlu install apa-apa.</p>
        </div>

        <Link href="/" className="block text-center text-sm text-zinc-500 hover:text-zinc-700">
          ← Kembali ke beranda
        </Link>
      </div>
    </main>
  );
}
