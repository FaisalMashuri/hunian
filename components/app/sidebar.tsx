"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "./nav-icons";

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
    <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col overflow-y-auto border-r border-[#E4E3DF] bg-white sm:flex">
      {/* Logo */}
      <div className="flex items-center gap-2.5 border-b border-[#E4E3DF] px-5 py-[18px]">
        <span className="grid h-7 w-7 place-items-center rounded-lg bg-teal-700 text-white">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M3 10.5 12 3l9 7.5" />
            <path d="M5 9.5V21h14V9.5" />
            <path d="M9 21v-6h6v6" />
          </svg>
        </span>
        <span className="text-[17px] font-extrabold tracking-tight text-zinc-900">Hunian</span>
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
