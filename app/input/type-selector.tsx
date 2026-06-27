"use client";

import type { PropertyType } from "@/lib/types/db";

const TYPES: { key: PropertyType; emoji: string; name: string; desc: string }[] = [
  { key: "kontrakan", emoji: "🏠", name: "Kontrakan", desc: "Rumah sewaan" },
  { key: "apartemen", emoji: "🏢", name: "Apartemen", desc: "Unit di gedung" },
  { key: "kost", emoji: "🛏️", name: "Kost", desc: "Kamar kost" },
];

export function TypeSelector({ value, onChange }: { value: PropertyType; onChange: (t: PropertyType) => void }) {
  return (
    <>
      <div className="mb-3 text-sm font-bold text-zinc-900">Jenis Properti</div>
      <div className="mb-5 grid grid-cols-3 gap-2 sm:gap-2.5">
        {TYPES.map((t) => {
          const active = value === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => onChange(t.key)}
              className={`relative rounded-2xl border-2 px-2 py-3.5 text-center transition-colors sm:px-3 sm:py-4 ${
                active ? "border-teal-700 bg-teal-50" : "border-[#E4E3DF] bg-white hover:border-teal-200"
              }`}
            >
              <span className="mb-1.5 block text-[26px] sm:mb-2 sm:text-[28px]">{t.emoji}</span>
              <div className="text-[13px] font-bold text-zinc-900 sm:text-sm">{t.name}</div>
              <div className="mt-0.5 text-[11px] text-zinc-500 sm:text-[11.5px]">{t.desc}</div>
            </button>
          );
        })}
      </div>
    </>
  );
}
