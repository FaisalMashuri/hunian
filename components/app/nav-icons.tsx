// Ikon + daftar item navigasi bersama (dipakai sidebar desktop & bottom nav mobile).
// Path SVG mengikuti mockup (rumah berpintu, dua bar, gear).

export function IconHome({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.3 : 2} strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px]">
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
      <path d="M9 21v-6h6v6" />
    </svg>
  );
}

export function IconCompare({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.3 : 2} strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px]">
      <rect width="5" height="18" x="3" y="3" rx="1" />
      <rect width="5" height="18" x="16" y="3" rx="1" />
    </svg>
  );
}

export function IconSettings({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.3 : 2} strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px]">
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export type NavItem = { href: string; label: string; Icon: (p: { active: boolean }) => React.ReactElement };

export const NAV_ITEMS: NavItem[] = [
  { href: "/kandidat", label: "Kandidat", Icon: IconHome },
  { href: "/bandingkan", label: "Bandingkan", Icon: IconCompare },
  { href: "/pengaturan", label: "Pengaturan", Icon: IconSettings },
];
