"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "./nav-icons";
import { OptioMark } from "./optio-mark";

// Sidebar untuk layar besar (sm:flex) — persis mockup: logo, Menu, Konteks.
export function Sidebar({
  aside,
  navBadge,
}: {
  aside?: React.ReactNode;
  navBadge?: number;
}) {
  const pathname = usePathname();
  return (
    <aside className="fixed bottom-0 left-0 top-9 hidden w-64 flex-col overflow-y-auto border-r border-[#E4E3DF] bg-white sm:flex">
      {/* Logo */}
      <div className="flex items-center gap-2.5 border-b border-[#E4E3DF] px-5 py-[18px]">
        <OptioMark className="h-7 w-7 text-teal-700" />
        <span className="text-[17px] font-extrabold tracking-tight text-zinc-900">Optio</span>
      </div>

      {/* Menu */}
      <div className="px-3 pb-1.5 pt-3.5">
        <div className="px-2 pb-1 text-[10px] font-bold uppercase tracking-[0.08em] text-zinc-400">Menu</div>
        <nav className="flex flex-col gap-0.5">
          {NAV_ITEMS.map(({ href, label, Icon }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            const showBadge = href === "/dashboard" && navBadge != null && navBadge > 0;
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-2.5 rounded-[9px] px-2.5 py-2 text-[13px] transition-colors ${
                  active ? "bg-teal-50 font-semibold text-teal-700" : "font-medium text-zinc-500 hover:bg-[#F4F3F0] hover:text-zinc-900"
                }`}
              >
                <Icon active={active} />
                {label}
                {showBadge && (
                  <span className="ml-auto rounded-full bg-teal-700 px-[7px] py-px text-[10.5px] font-bold text-white">{navBadge}</span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Konteks */}
      {aside && (
        <div className="px-3 pb-4 pt-2.5">
          <div className="px-2 pb-1 text-[10px] font-bold uppercase tracking-[0.08em] text-zinc-400">Konteks</div>
          <div className="flex flex-col gap-2">{aside}</div>
        </div>
      )}
    </aside>
  );
}
