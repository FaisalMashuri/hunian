"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "./nav-icons";

// Bottom navigation untuk layar kecil saja (sm:hidden).
export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Navigasi utama"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-[#E4E3DF] bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur sm:hidden"
    >
      <div className="mx-auto flex max-w-md items-stretch justify-around px-2">
        {NAV_ITEMS.map(({ href, label, Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className="flex flex-1 flex-col items-center gap-1 py-2 text-[11px] font-medium"
            >
              <span
                className={`flex h-8 w-14 items-center justify-center rounded-full transition-colors ${
                  active ? "bg-teal-50 text-teal-700" : "text-zinc-400"
                }`}
              >
                <Icon active={active} />
              </span>
              <span className={active ? "text-teal-700" : "text-zinc-400"}>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
