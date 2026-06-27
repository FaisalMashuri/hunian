import { Sidebar } from "./sidebar";
import { BottomNav } from "./bottom-nav";

export type AppUser = { name: string; email: string; initial: string };

// Shell aplikasi (post-login). Desktop: sidebar kiri (nav + konteks + profil). Mobile: header + bottom nav.
// `bleed`: konten penuh tanpa max-width/padding (halaman atur sendiri) — agar topbar bisa mepet ujung-ujung.
export function AppShell({
  user: _user,
  children,
  aside,
  navBadge,
  bleed = false,
}: {
  user?: AppUser;
  children: React.ReactNode;
  aside?: React.ReactNode;
  navBadge?: number;
  bleed?: boolean;
}) {
  return (
    <div className="min-h-screen sm:pl-64">
      <Sidebar aside={aside} navBadge={navBadge} />

      {/* Header mobile — hanya untuk halaman non-bleed (halaman bleed punya topbar sendiri) */}
      {!bleed && (
        <header className="sticky top-0 z-20 flex h-14 items-center border-b border-zinc-200/70 bg-stone-50/85 px-4 backdrop-blur sm:hidden">
          <span className="text-lg font-extrabold tracking-tight text-zinc-900">
            Hunian<span className="text-teal-700">.</span>
          </span>
        </header>
      )}

      <main className={bleed ? "w-full pb-28 sm:pb-12" : "mx-auto w-full max-w-6xl px-4 pb-28 pt-4 sm:px-6 sm:pb-12"}>
        {children}
      </main>

      <BottomNav />
    </div>
  );
}
