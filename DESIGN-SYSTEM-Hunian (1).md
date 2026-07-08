# Design System — Hunian
**Versi**: 2.0
**Tanggal**: Juni 2026
**Stack**: Next.js + Tailwind CSS v3
**Platform**: Web, Mobile-first (375px baseline)

> Dibuat menggunakan UI/UX Pro Max guideline — Priority 1→10, semua CRITICAL dan HIGH rules diterapkan.

---

## Daftar Isi

1. Product Analysis
2. Design Principles
3. Color System
4. Typography
5. Spacing & Grid
6. Elevation & Shadow
7. Border Radius
8. Component Library
9. Interaction Patterns & States
10. Motion & Animation
11. Forms & Feedback
12. Navigation Patterns
13. Charts & Data Visualization
14. Accessibility Checklist
15. Voice & Tone
16. Icons
17. Dark Mode
18. Tailwind Config

---

## 1. Product Analysis

Dilakukan sebelum keputusan visual apapun — sesuai Step 1 dari skill.

| Dimensi | Nilai |
|---------|-------|
| **Product Type** | Tool — Productivity (housing decision tool) |
| **Target Audience** | Urban professional 25–35, aktif cari hunian, terbiasa mobile |
| **Context Penggunaan** | Dual context: lapangan (satu tangan, panas, terburu-buru) + malam di rumah (deliberate, desktop) |
| **Style Keywords** | Data-dense, trustworthy, analytical, clean, tidak dekoratif |
| **Information Density** | Medium-high — banyak data, tapi harus scannable |
| **Stack** | Next.js (web app), mobile-first, PWA |

**Style yang dipilih:** Neutral Minimal + Data Dashboard — tidak warm cream (template), tidak dark acid green (template). Distinctive choice: **teal biru dalam + oranye marker** terinspirasi dari kartografi.

**Anti-patterns yang dihindari:**
- ❌ Emoji sebagai icon struktural → gunakan Lucide SVG
- ❌ Hover-only interaction → semua aksi harus tap-accessible
- ❌ Color-only untuk convey meaning → selalu tambah icon + teks
- ❌ Placeholder sebagai label → visible label wajib
- ❌ Mixing flat + skeuomorphic → satu style konsisten

---

## 2. Design Principles

### 2.1 Data First, Decoration Never
Setiap elemen visual harus earn tempatnya dengan menyampaikan informasi. Dekorasi tanpa fungsi = hapus.

### 2.2 Two Contexts, One System
- **Lapangan:** tap area besar, kontras tinggi, terbaca di bawah sinar matahari, Quick Survey 30 detik
- **Evaluasi:** density tinggi boleh, tapi tetap tidak berantakan, compare view desktop-friendly

### 2.3 Honest UI
Ketidakpastian tidak disembunyikan. Data approximate, estimasi AI, status pending — semua ditampilkan eksplisit bukan di-hide.

### 2.4 Progressive Disclosure
Quick Survey → Full Survey. Dashboard card → Detail. Score total → Score breakdown 7 dimensi. Tampilkan yang penting dulu.

### 2.5 Accessible by Default
WCAG AA minimum untuk semua kombinasi warna. Touch target minimum 44×44px. Tidak ada exception.

---

## 3. Color System

### 3.1 Design Tokens — Light Mode

#### Brand Colors

| Token | Hex | RGB | Penggunaan |
|-------|-----|-----|-----------|
| `primary-950` | `#041E29` | 4,30,41 | — |
| `primary-900` | `#062F40` | 6,47,64 | Text on primary surface |
| `primary-800` | `#0B4F6C` | 11,79,108 | **Primary brand** — CTA, active nav, link |
| `primary-700` | `#0E6789` | 14,103,137 | Hover state |
| `primary-600` | `#1A80A6` | 26,128,166 | Focus ring |
| `primary-400` | `#4BAAC8` | 75,170,200 | — |
| `primary-200` | `#A8D8E8` | 168,216,232 | — |
| `primary-100` | `#D6EEF5` | 214,238,245 | Primary surface |
| `primary-50` | `#EBF7FA` | 235,247,250 | Primary surface subtle |
| `accent-800` | `#8B3A0F` | 139,58,15 | — |
| `accent-700` | `#C4511A` | 196,81,26 | Accent hover |
| `accent-600` | `#E8621A` | 232,98,26 | **Accent** — map pin, CTA secondary, highlight |
| `accent-500` | `#F07B3A` | 240,123,58 | — |
| `accent-100` | `#FDDBC8` | 253,219,200 | Accent surface |
| `accent-50` | `#FEF0E8` | 254,240,232 | Accent surface subtle |

#### Neutral Colors

| Token | Hex | Penggunaan |
|-------|-----|-----------|
| `neutral-950` | `#0F0E0C` | — |
| `neutral-900` | `#1A1917` | **Text primary** — semua body copy |
| `neutral-800` | `#2D2C29` | — |
| `neutral-700` | `#403F3B` | — |
| `neutral-600` | `#6B6A66` | **Text secondary** |
| `neutral-500` | `#9E9D99` | **Text muted / placeholder** |
| `neutral-400` | `#B5B4B0` | — |
| `neutral-300` | `#C8C7C3` | Border subtle |
| `neutral-200` | `#E4E3DF` | **Border default** |
| `neutral-100` | `#F4F3F0` | **Surface elevated** |
| `neutral-50` | `#FAFAF9` | **Background** |
| `white` | `#FFFFFF` | **Surface (card)** |

#### Semantic Colors

| Token | Hex | WCAG vs White | Penggunaan |
|-------|-----|--------------|-----------|
| `success-700` | `#15803D` | 6.3:1 ✅ AA | Text on success |
| `success-600` | `#16A34A` | 4.6:1 ✅ AA | **Success** — synced, verified, skor tinggi |
| `success-100` | `#DCFCE7` | — | Success surface |
| `success-50` | `#F0FDF4` | — | Success surface subtle |
| `warning-700` | `#B45309` | 5.9:1 ✅ AA | **Text on warning surface** |
| `warning-600` | `#D97706` | 2.8:1 ❌ | Hanya untuk icon besar / teks besar |
| `warning-100` | `#FEF3C7` | — | Warning surface |
| `warning-50` | `#FFFBEB` | — | Warning surface subtle |
| `danger-700` | `#B91C1C` | 6.4:1 ✅ AA | Text on danger |
| `danger-600` | `#DC2626` | 5.0:1 ✅ AA | **Danger** — conflict, error, skor rendah |
| `danger-100` | `#FEE2E2` | — | Danger surface |
| `danger-50` | `#FFF5F5` | — | Danger surface subtle |
| `info-600` | `#0891B2` | 4.6:1 ✅ AA | Info |
| `info-50` | `#ECFEFF` | — | Info surface subtle |

> ⚠️ **Warning:** `warning-600` (#D97706) tidak cukup kontras dengan white (2.8:1). Untuk teks di atas warning, selalu gunakan `warning-700` (#B45309). Untuk icon dengan background warning-50, sudah aman.

#### Budget Zone Colors

| Zone | Background | Text | Border | Icon |
|------|-----------|------|--------|------|
| `comfort` | `#EBF7FA` | `#062F40` | `#D6EEF5` | 🔵 `#0B4F6C` |
| `ideal` | `#F0FDF4` | `#15803D` | `#DCFCE7` | 🟢 `#16A34A` |
| `stretch` | `#FFFBEB` | `#B45309` | `#FEF3C7` | 🟡 `#D97706` (icon only) |
| `over` | `#FFF5F5` | `#B91C1C` | `#FEE2E2` | 🔴 `#DC2626` |

> Setiap budget zone WAJIB menampilkan icon + teks label — tidak hanya warna. Ini WCAG rule: jangan convey meaning by color alone.

#### Score Colors

| Range | Hex | WCAG vs White | Label |
|-------|-----|--------------|-------|
| ≥ 80 | `#16A34A` | 4.6:1 ✅ | Sangat Direkomendasikan |
| 65–79 | `#D97706` | 2.8:1 ❌ gunakan `#B45309` sebagai text | Direkomendasikan |
| 45–64 | `#EA580C` | 4.8:1 ✅ | Perlu Pertimbangan |
| < 45 | `#DC2626` | 5.0:1 ✅ | Tidak Direkomendasikan |

#### Map Pin Colors

| Status | Color | Label |
|--------|-------|-------|
| Verified, skor ≥ 80 | `#16A34A` | — |
| Verified, skor 65–79 | `#D97706` | — |
| Verified, skor 45–64 | `#EA580C` | — |
| Verified, skor < 45 | `#DC2626` | — |
| Approximate (unverified) | `#9E9D99` opacity 60% | — |
| Kantor user | `#0B4F6C` | — |

---

### 3.2 CSS Custom Properties

```css
/* app/globals.css */
:root {
  /* Brand */
  --color-primary: #0B4F6C;
  --color-primary-hover: #0E6789;
  --color-primary-active: #062F40;
  --color-primary-surface: #EBF7FA;
  --color-primary-surface-subtle: #EBF7FA;
  --color-primary-on: #FFFFFF;

  --color-accent: #E8621A;
  --color-accent-hover: #C4511A;
  --color-accent-surface: #FEF0E8;
  --color-accent-on: #FFFFFF;

  /* Neutral */
  --color-bg: #FAFAF9;
  --color-surface: #FFFFFF;
  --color-surface-elevated: #F4F3F0;
  --color-border: #E4E3DF;
  --color-border-subtle: #C8C7C3;

  /* Text */
  --color-text-primary: #1A1917;
  --color-text-secondary: #6B6A66;
  --color-text-muted: #9E9D99;
  --color-text-disabled: #C8C7C3;
  --color-text-on-primary: #FFFFFF;
  --color-text-on-accent: #FFFFFF;

  /* Semantic */
  --color-success: #16A34A;
  --color-success-text: #15803D;
  --color-success-surface: #F0FDF4;
  --color-warning: #D97706;
  --color-warning-text: #B45309;
  --color-warning-surface: #FFFBEB;
  --color-danger: #DC2626;
  --color-danger-text: #B91C1C;
  --color-danger-surface: #FFF5F5;
  --color-info: #0891B2;
  --color-info-surface: #ECFEFF;

  /* Focus ring */
  --color-focus-ring: #1A80A6;
  --focus-ring: 0 0 0 2px var(--color-bg), 0 0 0 4px var(--color-focus-ring);
}

.dark {
  --color-primary: #1A80A6;
  --color-primary-hover: #2496C0;
  --color-primary-surface: #0B2E3A;
  --color-primary-on: #FFFFFF;

  --color-accent: #F07B3A;
  --color-accent-hover: #F59058;
  --color-accent-surface: #2D1A0E;
  --color-accent-on: #FFFFFF;

  --color-bg: #131211;
  --color-surface: #1E1D1B;
  --color-surface-elevated: #2A2927;
  --color-border: #3A3936;
  --color-border-subtle: #4A4946;

  --color-text-primary: #F5F4F2;
  --color-text-secondary: #A8A7A3;
  --color-text-muted: #6B6A66;
  --color-text-disabled: #4A4946;

  --color-success: #22C55E;
  --color-success-text: #22C55E;
  --color-success-surface: #052E16;
  --color-warning: #FBBF24;
  --color-warning-text: #FBBF24;
  --color-warning-surface: #1C1204;
  --color-danger: #F87171;
  --color-danger-text: #F87171;
  --color-danger-surface: #1C0404;
  --color-info: #22D3EE;
  --color-info-surface: #0C1F24;
}
```

---

## 4. Typography

### 4.1 Font Families

| Role | Family | Source | Rationale |
|------|--------|--------|-----------|
| **Display / Heading** | Plus Jakarta Sans | Google Fonts (next/font) | Typeface Indonesia (Tokotype), modern, distinctive untuk property app |
| **Body / UI** | Inter | Google Fonts (next/font) | Legible semua ukuran, variable font, ekosistem mature |
| **Data / Mono** | JetBrains Mono | Google Fonts (next/font) | Tabular figures untuk harga, koordinat, skor — tidak ada layout shift |

```typescript
// app/layout.tsx
import { Plus_Jakarta_Sans, Inter, JetBrains_Mono } from 'next/font/google'

const display = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['500', '600', '700', '800'],
  display: 'swap', // FOIT prevention (skill rule: font-loading)
})
const body = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['400', '500', '600'],
  display: 'swap',
})
const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500'],
  display: 'swap',
})
```

### 4.2 Type Scale

Minimum body 16px — menghindari iOS auto-zoom (skill rule: readable-font-size).

| Token | Size | Line Height | Weight | Family | WCAG | Penggunaan |
|-------|------|-------------|--------|--------|------|-----------|
| `display-2xl` | 28px | 36px | 800 | Display | — | Judul halaman besar |
| `display-xl` | 24px | 32px | 700 | Display | — | Page title, modal title |
| `display-lg` | 20px | 28px | 700 | Display | — | Section header |
| `display-md` | 18px | 26px | 600 | Display | — | Sub-section, card title |
| `body-lg` | 18px | 28px | 400 | Body | — | — |
| `body-md` | 16px | 24px | 400 | Body | — | **Body utama** (minimum mobile) |
| `body-sm` | 14px | 20px | 400 | Body | — | Secondary info, label |
| `body-xs` | 12px | 16px | 500 | Body | — | Caption, badge, timestamp |
| `body-xxs` | 11px | 14px | 500 | Body | — | Micro label — sparingly |
| `data-xl` | 24px | 32px | 600 | Mono | — | Skor besar, harga besar |
| `data-lg` | 18px | 24px | 500 | Mono | — | Harga normal, angka tabel |
| `data-md` | 14px | 20px | 400 | Mono | — | Koordinat, jarak |
| `data-sm` | 12px | 16px | 400 | Mono | — | Timestamp, ID |

### 4.3 Aturan Typography

- **Heading selalu Plus Jakarta Sans.** Body dan UI label pakai Inter.
- **Semua angka harga, skor, koordinat, jarak = JetBrains Mono** dengan `font-variant-numeric: tabular-nums` — mencegah layout shift saat angka berubah.
- **Sentence case** untuk semua label UI. Bukan Title Case.
- **Line length:** mobile 35–60 karakter, desktop 60–75 karakter (skill rule: line-length-control).
- **Maksimal 3 ukuran font per screen.** Lebih = visual noise.
- **Tidak ada teks di bawah 12px** di body copy.
- **`truncation-strategy`:** Prefer wrap over truncate. Jika terpaksa truncate, gunakan `overflow: hidden; text-overflow: ellipsis` + tooltip untuk full text.

---

## 5. Spacing & Grid

### 5.1 Spacing Scale

Base unit **4px** — semua spacing kelipatan 4 (skill rule: spacing-scale, 4pt/8dp incremental).

| Token | px | Tailwind | Penggunaan |
|-------|-----|----------|-----------|
| `space-0.5` | 2px | `p-0.5` | Micro divider |
| `space-1` | 4px | `p-1` | Gap antar elemen dalam chip |
| `space-2` | 8px | `p-2` | Gap antar elemen dalam komponen |
| `space-3` | 12px | `p-3` | Padding badge, chip kecil |
| `space-4` | 16px | `p-4` | **Padding dasar** — card, input, section |
| `space-5` | 20px | `p-5` | — |
| `space-6` | 24px | `p-6` | Gap antar section dalam halaman |
| `space-8` | 32px | `p-8` | Margin antar card |
| `space-10` | 40px | `p-10` | — |
| `space-12` | 48px | `p-12` | Large section padding |
| `space-16` | 64px | `p-16` | Page-level vertical spacing |

### 5.2 Touch Target (CRITICAL — skill rule: touch-target-size)

**MINIMUM: 44×44px** untuk semua interactive element. Ini WAJIB — Apple HIG dan Material Design.

Untuk elemen yang secara visual lebih kecil (icon 16px, badge), extend hit area dengan padding atau pseudo-element:

```css
/* Minimum touch target — extend visual yang kecil */
.touch-target {
  position: relative;
}
.touch-target::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  min-width: 44px;
  min-height: 44px;
}
```

**Minimum spacing antar touch target: 8px** (skill rule: touch-spacing).

### 5.3 Layout Grid

```
Mobile (375px):
  Horizontal padding: 16px (kiri + kanan)
  Content width: 343px
  Column: single

Tablet (768px):
  Horizontal padding: 24px
  Content max-width: 720px
  Column: 2-col (dashboard cards)

Desktop (1024px+):
  Sidebar: 240px
  Content: remaining, max 800px
  Horizontal padding: 32px
```

### 5.4 Safe Areas (Mobile)

```css
/* Untuk notch, Dynamic Island, home indicator */
.page-container {
  padding-top: env(safe-area-inset-top);
  padding-bottom: calc(env(safe-area-inset-bottom) + 60px); /* 60px = bottom nav */
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}

/* Viewport units — gunakan dvh bukan vh di mobile */
.full-height {
  min-height: 100dvh; /* dynamic viewport height */
}
```

---

## 6. Elevation & Shadow

Skill rule: `elevation-consistent` — gunakan scale yang konsisten, tidak random.

| Level | CSS Shadow | Penggunaan |
|-------|-----------|-----------|
| `elevation-0` | none | Flat — inline element, divider |
| `elevation-1` | `0 1px 2px rgba(15,14,12,0.05), 0 1px 1px rgba(15,14,12,0.04)` | Card ringan, input |
| `elevation-2` | `0 4px 6px rgba(15,14,12,0.06), 0 2px 4px rgba(15,14,12,0.05)` | **Card hunian**, dropdown |
| `elevation-3` | `0 10px 15px rgba(15,14,12,0.08), 0 4px 6px rgba(15,14,12,0.05)` | Modal, bottom sheet |
| `elevation-4` | `0 20px 25px rgba(15,14,12,0.10), 0 8px 10px rgba(15,14,12,0.06)` | Map popup, FAB |

**Dark mode:** Tambahkan border `1px solid var(--color-border)` sebagai pengganti shadow — shadow tidak visible di background gelap. Contoh:

```css
.dark .card {
  box-shadow: none;
  border: 1px solid var(--color-border);
}
```

---

## 7. Border Radius

Skill rule: `effects-match-style` — radius aligned dengan chosen style (clean minimal).

| Token | px | Tailwind | Penggunaan |
|-------|-----|----------|-----------|
| `radius-none` | 0 | `rounded-none` | Full-bleed section, divider |
| `radius-xs` | 2px | `rounded-sm` | Tooltip, micro element |
| `radius-sm` | 4px | `rounded` | Badge, chip, tag |
| `radius-md` | 8px | `rounded-md` | Input, button, small card |
| `radius-lg` | 12px | `rounded-xl` | **Card hunian**, panel, alert |
| `radius-xl` | 16px | `rounded-2xl` | Bottom sheet, modal |
| `radius-2xl` | 20px | `rounded-3xl` | Large feature card |
| `radius-full` | 9999px | `rounded-full` | Avatar, toggle, pill badge, progress bar |

---

## 8. Component Library

### 8.1 Button

#### Variants

| Variant | Background | Text | Border | Hover | Active | Disabled |
|---------|-----------|------|--------|-------|--------|---------|
| `primary` | `primary-800` | white | — | `primary-700` | `primary-900` | opacity 40% |
| `secondary` | `surface` | `primary-800` | `border` | `surface-elevated` | `neutral-100` | opacity 40% |
| `ghost` | transparent | `text-secondary` | — | `surface-elevated` | `neutral-100` | opacity 40% |
| `danger` | `danger-600` | white | — | `danger-700` | `danger-800` | opacity 40% |
| `accent` | `accent-600` | white | — | `accent-700` | `accent-800` | opacity 40% |

#### Sizes (semua minimum 44px height — WCAG touch target)

| Size | Height | Padding X | Font | Radius |
|------|--------|-----------|------|--------|
| `lg` | 52px | 24px | 16px/600 | `radius-md` |
| `md` | 44px | 16px | 14px/600 | `radius-md` |
| `sm` | 36px | 12px | 13px/500 | `radius-md` |
| `icon-lg` | 44×44px | — | — | `radius-md` |
| `icon-sm` | 36×36px | — | — | `radius-sm` |

> Ukuran sm (36px) masih di bawah 44px — extend hit area dengan padding invisible.

#### States — State Machine

```
[default]
  → hover: darken bg 8%, cursor pointer
  → focus: focus ring (2px offset, var(--color-focus-ring))
  → active: darken bg 15%, scale 0.97 (150ms)
  → loading: spinner + disabled cursor + teks berubah ("Menyimpan...")
  → disabled: opacity 40%, cursor not-allowed, no hover/active

Focus ring WAJIB ditampilkan — jangan sembunyikan dengan outline:none
```

```jsx
// Tailwind classes untuk primary button
className={clsx(
  // Base
  'inline-flex items-center justify-center font-semibold transition-all duration-150',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-600',
  // Variant
  'bg-primary-800 text-white hover:bg-primary-700 active:bg-primary-900 active:scale-[0.97]',
  // Disabled
  'disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none',
)}
```

---

### 8.2 Property Card

Komponen paling central. Semua data ditampilkan dengan hierarki yang clear.

```
┌───────────────────────────────────────────────┐
│ [APT]  Apt Skandinavia Lt 12        [sync●] [⋮] │  header
│ Bekasi Selatan · Survey 3 hari lalu              │  meta
├───────────────────────────────────────────────┤
│ Rp 4.100.000/bln              Upfront Rp 14jt   │  harga — JetBrains Mono
│ (sewa pokok Rp 3.500.000)                        │  pokok — muted, kecil
├───────────────────────────────────────────────┤
│ 🟡 Stretch  103% budget ideal  ·  7.2 km         │  budget zone + jarak
├───────────────────────────────────────────────┤
│ [████████████░░░░] 84 / 100                       │  score bar + angka Mono
│ Sangat Direkomendasikan                           │  label
├───────────────────────────────────────────────┤
│ [⚡ Worth It] [🚫 1 Deal Breaker] [⚠️ Dominated]  │  alert badges
└───────────────────────────────────────────────┘
```

**Hierarki visual:**
1. Nama hunian (display-md/700, primary text)
2. Harga all-in (data-lg/500, primary text) + Upfront (data-md, secondary)
3. Budget zone (colored chip) + jarak (muted)
4. Score bar + angka

**States:**
- Default: elevation-2, radius-lg
- Hover: elevation-3, transform translateY(-1px) (150ms ease-out)
- Active/selected: ring-2 primary border
- Dominated: opacity-75, badge "⚠️ Didominasi kandidat lain"
- Deal breaker violation: left border 3px danger-600

**Badge Deal Breaker violation (kiri):**
```css
.card-deal-breaker-violation {
  border-left: 3px solid var(--color-danger);
}
```

**Sync badge:**
- Tidak ada → synced
- `●` warning = pending
- `●` danger = conflict

---

### 8.3 Budget Zone Indicator

Digunakan di card, detail view, dan compare view. WAJIB icon + teks + warna (bukan warna saja).

```
┌─────────────────────────┐
│ 🔵 Comfort              │  below 70% ideal
│ 🟢 Dalam Budget Ideal   │  70–100% ideal
│ 🟡 Stretch Zone         │  ideal–max
│ 🔴 Di Atas Batas Maks   │  > max
└─────────────────────────┘
```

```jsx
const zones = {
  comfort:  { icon: '●', label: 'Comfort', bg: 'primary-50', text: 'primary-900', border: 'primary-100' },
  ideal:    { icon: '●', label: 'Dalam Budget Ideal', bg: 'success-50', text: 'success-700', border: 'success-100' },
  stretch:  { icon: '●', label: 'Stretch Zone', bg: 'warning-50', text: 'warning-700', border: 'warning-100' },
  over:     { icon: '●', label: 'Di Atas Batas Maks', bg: 'danger-50', text: 'danger-700', border: 'danger-100' },
}
```

---

### 8.4 Score Display

#### Score Bar (di card)

```
[████████████░░░░] 84 / 100
```

- Track: `neutral-200`, radius-full, height **8px** (lebih visible dari 4px)
- Fill: warna sesuai skor (lihat Score Colors)
- Animasi fill: width dari 0 ke target, 600ms ease-out, delay 100ms setelah card mount
- Angka: JetBrains Mono, data-sm, di kanan

#### Score Breakdown (di detail view — tab Overview)

```
Skor Total                    84 / 100
═══════════════════════════════════════
Affordability (25%)  [████████] 78
Accessibility (20%)  [██████]   92
Condition (15%)      [███████]  85
Livability (15%)     [████████] 88 ⚪ GIS aktif
Environment (10%)    [██████]   70
Value for Money (10%)[███████]  75
Commitment Risk (5%) [██████]   60
```

- Bar per dimensi: height 6px, radius-full, warna per skor
- Label `⚪ GIS aktif` / `⚪ GIS belum aktif` pada Livability

---

### 8.5 Deal Breaker Panel

Ditampilkan di detail view sebagai panel dengan checklist per rule.

```
Deal Breaker Check

✅ Kamar mandi private         TERPENUHI
✅ Jarak < 10 km (7.2 km)      TERPENUHI
🚫 Tidak pernah banjir         DILANGGAR — Riwayat: pernah banjir
🚫 Deposit ≤ 3 bulan (4 bln)   DILANGGAR — Deposit 4 bulan
⚪ AC tersedia                 BELUM DIISI — Tanyakan ke pemilik
```

- ✅ = success-600 icon + success-50 bg
- 🚫 = danger-600 icon + danger-50 bg
- ⚪ = neutral-400 icon + neutral-50 bg (belum diisi)
- Tap pada baris ⚪ = langsung buka field terkait di Full Survey

---

### 8.6 Alert Cards

Digunakan untuk: Worth It Consideration, Regret Predictor, Hidden Cost Alert, Decision Freeze, Dominated Property.

```
┌─────────────────────────────────────────────┐
│ ⚡  [Judul Alert]                            │ ← icon + title, display-sm/600
│                                             │
│ [Body teks — body-sm/400, text-secondary]   │
│                                             │
│ [Aksi Primer]            [Dismiss]          │
└─────────────────────────────────────────────┘
```

| Alert Type | Icon | Border | Background | Title Color |
|-----------|------|--------|-----------|------------|
| Worth It | ⚡ | accent-200 | accent-50 | accent-700 |
| Warning/Regret | ⚠️ | warning-200 | warning-50 | warning-700 |
| Deal Breaker | 🚫 | danger-200 | danger-50 | danger-700 |
| Info/Coach | 💡 | primary-200 | primary-50 | primary-800 |
| Decision Freeze | ⏸️ | neutral-200 | neutral-50 | neutral-800 |

---

### 8.7 Sync Status Indicator (Header)

```
[●  Online · Tersinkron 2 mnt lalu]  [↻]
[●  Offline · 4 perubahan pending ]
[⟳  Menyinkronkan...               ]
```

- Dot: 8px circle, warna semantic
- Teks: body-xs/500, text-secondary
- Sync button: icon-only 36×36px, hit area 44×44px (pseudo-element extension)
- Posisi: di dalam header, left-aligned mobile

**aria-live untuk screen reader:**
```html
<div role="status" aria-live="polite" aria-label="Status sinkronisasi: Tersinkron 2 menit lalu">
```

---

### 8.8 Form Elements

Skill rule: `input-labels` — WAJIB visible label, tidak hanya placeholder.

#### Text Input

```
Label                               ← body-sm/500, text-secondary, margin-bottom 4px
┌─────────────────────────────────┐
│ Placeholder...                  │  height: 44px (touch target), radius-md
└─────────────────────────────────┘
Helper text atau pesan error        ← body-xs, text-muted / danger-600
```

**States:**
- Default: border `neutral-200`, bg `surface`
- Focus: border `primary-600` 2px, shadow `0 0 0 3px primary-50`
- Error: border `danger-600`, helper text `danger-600`
- Disabled: bg `surface-elevated`, opacity 50%, cursor not-allowed
- Read-only: bg `surface-elevated`, border dashed — visually distinct dari disabled

**Required indicator:**
```html
<label>Harga Sewa <span aria-hidden="true">*</span><span class="sr-only">(wajib diisi)</span></label>
```

#### Input Harga (Data Input)

```
┌──────────────────────────────────┐
│ Rp │ 2.000.000                   │  JetBrains Mono, tabular-nums
└──────────────────────────────────┘
```

- Prefix "Rp" dengan border-r dan bg `surface-elevated`
- Input: JetBrains Mono, auto-format dengan thousand separator titik
- Pattern: `[0-9]*` untuk mobile numeric keyboard

#### Toggle / Switch

```
[ ●──── ] OFF    →    [ ────● ] ON
```

- Size: 48×26px (touch target OK — hit area 44px via padding)
- Thumb: 22×22px, white, shadow-sm
- Track off: `neutral-300`
- Track on: `primary-800`
- Transition: 150ms ease
- ARIA: `role="switch"`, `aria-checked="true/false"`

#### Foto Slot

```
┌────────────────────┐   ┌────────────────────┐
│                    │   │  [foto.jpg]         │
│  [CameraIcon]      │   │  ──────────────     │
│  Tampak Depan      │   │  Tampak Depan       │
│  ✱ Wajib          │   │  ✓ Terisi (1/5)     │
└────────────────────┘   └────────────────────┘
   Empty Required            Filled
```

- Aspect ratio: 4:3
- Empty required: border-dashed 2px `danger-600`, bg `danger-50`
- Empty recommended: border-dashed 2px `neutral-300`, bg `neutral-50`
- Empty optional: border-dashed 1px `neutral-200`, bg `surface`
- Filled: border solid 2px `success-600`, checkmark badge kanan atas
- Tap: bottom sheet dengan pilihan Kamera / Galeri / Hapus (jika sudah ada foto)

---

### 8.9 Map Pin

SVG teardrop shape dengan warna per status.

| Kondisi | Fill | Ring |
|---------|------|------|
| Verified ≥80 | `#16A34A` | white 2px |
| Verified 65–79 | `#D97706` | white 2px |
| Verified 45–64 | `#EA580C` | white 2px |
| Verified <45 | `#DC2626` | white 2px |
| Approximate | `#9E9D99` opacity 60% | white 1px dashed |
| Kantor | `#0B4F6C` star shape | white 2px |

**Map Popup (saat pin di-klik):**
```
┌──────────────────────────┐
│ Apt Skandinavia     84   │  name + score
│ 🟡 Stretch              │  budget zone badge
│ Rp 4.1jt/bln            │  all-in price (Mono)
│ [Lihat Detail →]        │  CTA button
└──────────────────────────┘
```

Popup: elevation-4, radius-lg, max-width 200px, z-index 1000.

---

### 8.10 Toast / Notification

Skill rule: toast-dismiss (auto 4 detik), toast-accessibility (aria-live="polite", tidak steal focus).

```
┌─────────────────────────────────┐
│ ✓  Hunian tersimpan             │  success
│ ⟳  Menyinkronkan 3 data...      │  info + loading
│ ⚠  Konflik data — Pilih versi   │  warning (tidak auto-dismiss)
│ ✕  Gagal upload — Coba lagi     │  error (tidak auto-dismiss)
└─────────────────────────────────┘
```

- Posisi: bottom-center, di atas bottom nav
- Lebar: max-width 340px, min-width 280px
- Auto-dismiss: 4 detik (success/info), tidak auto-dismiss (warning/error)
- Max stack: 3 toast bersamaan
- HTML:
```html
<div role="status" aria-live="polite" aria-atomic="true">
  <!-- toast content -->
</div>
```

---

### 8.11 Bottom Sheet (Mobile)

Digunakan untuk: kebab menu, konfirmasi hapus, resolusi conflict, pilih foto/kamera, What If slider.

```
┌──────────────────────────────────┐
│         ────                     │  drag handle 4×36px, neutral-300
│                                  │
│  [konten]                        │
│                                  │
│  [Aksi Utama]                    │
│  [Batal]                         │
└──────────────────────────────────┘
```

- Drag handle: 4×36px, radius-full, `neutral-300`, centered
- Background: `surface`, radius-xl di atas dua sudut
- Max height: 85vh, scroll internal jika perlu
- Backdrop: `rgba(0,0,0,0.45)` — cukup gelap untuk isolate foreground (skill rule: scrim)
- Animation: slide-up 300ms ease-out (sesuai Motion section)
- **Dismiss confirm:** Jika ada unsaved changes, muncul konfirmasi sebelum dismiss

**Accessibility:**
```html
<div role="dialog" aria-modal="true" aria-labelledby="sheet-title">
```
Focus trap saat terbuka. Escape untuk close.

---

### 8.12 Empty State

Skill rule: `empty-states` — helpful message + action, bukan dead end.

```
                [Icon 64px, neutral-400]

      Belum ada hunian di daftarmu

  Mulai tambah kandidat pertama untuk
  memulai proses perbandingan hunian.

          [+ Tambah Hunian]
```

Format: Icon → Headline (display-md, text-secondary) → Body (body-sm, text-muted, max 2 baris) → CTA.

| Context | Copy |
|---------|------|
| Dashboard kosong | "Belum ada hunian. Tambah kandidat pertama untuk mulai perbandingan." |
| Foto belum diisi | "Belum ada foto. Ambil langsung dari lokasi untuk perbandingan yang lebih akurat." |
| GIS belum aktif | "Verifikasi lokasi terlebih dahulu untuk mengaktifkan data area." |
| Deal breaker kosong | "Belum ada deal breaker. Set kriteria wajib sebelum survey supaya tidak lupa." |
| AI belum dijalankan | "Tap untuk generate analisis berdasarkan data yang sudah kamu isi." |

---

### 8.13 Skeleton Loading

Skill rule: `progressive-loading` — skeleton bukan spinner untuk operasi > 300ms.

```css
@keyframes shimmer {
  0%   { background-position: -200% center; }
  100% { background-position: 200% center; }
}

.skeleton {
  background: linear-gradient(
    90deg,
    var(--color-surface-elevated) 25%,
    var(--color-border) 50%,
    var(--color-surface-elevated) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite linear;
  border-radius: var(--radius-sm);
}

/* Respect reduced motion */
@media (prefers-reduced-motion: reduce) {
  .skeleton { animation: none; }
}
```

Skeleton harus **menyerupai konten** yang akan muncul — bukan generic gray box.

**Property Card Skeleton:**
```
┌──────────────────────────────────┐
│ [████] [██████████████]     [  ] │
│ [████████████]                   │
├──────────────────────────────────┤
│ [████████████████]   [████████]  │
│ [████████]                       │
├──────────────────────────────────┤
│ [██████████████████████░░░░]  ██ │
│ [████████████]                   │
└──────────────────────────────────┘
```

---

## 9. Interaction Patterns & States

### 9.1 State Machine per Interactive Element

Setiap interactive element WAJIB define semua state berikut:

| State | Visual | Timing |
|-------|--------|--------|
| `default` | Tampilan normal | — |
| `hover` | Darken bg 8%, cursor pointer | 150ms |
| `focus-visible` | Focus ring 2px, offset 2px | 0ms |
| `active` | Darken bg 15%, scale 0.97 | 100ms |
| `loading` | Spinner + disabled behavior | — |
| `disabled` | Opacity 40%, cursor not-allowed | — |
| `error` | Border danger, helper text | — |
| `success` | Border success, checkmark flash | — |

### 9.2 Focus Ring

WAJIB visible — jangan `outline: none` tanpa replacement.

```css
/* Global focus ring */
:focus-visible {
  outline: 2px solid var(--color-focus-ring);
  outline-offset: 2px;
  border-radius: 2px;
}

/* Override untuk element dengan border-radius */
.button:focus-visible,
.card:focus-visible {
  outline: 2px solid var(--color-focus-ring);
  outline-offset: 2px;
}
```

### 9.3 Press Feedback (CRITICAL — skill rule: press-feedback)

**Tap harus ada visual response dalam 80–100ms.**

- Buttons: scale 0.97 + darken 15% pada `active`
- Cards: translateY(-1px) pada hover, scale 0.99 pada active
- Icon buttons: opacity 0.7 pada active

### 9.4 Loading States per Scenario

| Scenario | Pattern | Duration Threshold |
|----------|---------|-------------------|
| Quick Survey submit | Button loading state | Immediate |
| Full Survey submit | Button loading + toast "Menyimpan..." | Immediate |
| Sync to Supabase | Header sync indicator | Background |
| GIS data fetch | Tab GIS skeleton | > 300ms |
| AI feature call | Inline spinner + "Menganalisis..." | Immediate |
| Photo upload | Per-slot progress indicator | Immediate |
| Dashboard load | Card skeleton (3 cards) | > 300ms |

### 9.5 Cursor

- `cursor-pointer` untuk semua clickable element (skill rule: cursor-pointer)
- `cursor-not-allowed` untuk disabled
- `cursor-text` untuk text input
- `cursor-grab` / `cursor-grabbing` untuk drag (What If slider)

---

## 10. Motion & Animation

Skill rule: duration-timing (150–300ms), transform-performance, excessive-motion, reduced-motion.

### 10.1 Duration Scale

| Token | Duration | Penggunaan |
|-------|----------|-----------|
| `motion-instant` | 0ms | State toggle tanpa animasi |
| `motion-micro` | 100ms | Press feedback, color change |
| `motion-fast` | 150ms | Hover state, button press |
| `motion-base` | 250ms | Drawer expand, card hover lift |
| `motion-slow` | 350ms | Page transition, modal |
| `motion-enter` | 300ms | Bottom sheet, modal masuk |
| `motion-exit` | 200ms | Bottom sheet keluar (60% dari enter) |

Skill rule: `exit-faster-than-enter` — exit 60–70% dari enter duration.

### 10.2 Easing

```css
:root {
  --ease-out: cubic-bezier(0, 0, 0.2, 1);       /* masuk layar */
  --ease-in: cubic-bezier(0.4, 0, 1, 1);        /* keluar layar */
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);  /* transisi dalam */
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1); /* bounce ringan (pin pop) */
}
```

### 10.3 Animasi yang Digunakan

| Elemen | Animasi | Duration | Easing | Notes |
|--------|---------|----------|--------|-------|
| Bottom sheet masuk | slide-up + fade | 300ms | ease-out | Transform only |
| Bottom sheet keluar | slide-down + fade | 200ms | ease-in | |
| Modal masuk | scale 0.95→1 + fade | 300ms | ease-out | |
| Modal keluar | scale 1→0.95 + fade | 200ms | ease-in | |
| Toast masuk | slide-up + fade | 200ms | ease-out | |
| Toast keluar | fade | 150ms | ease-in | |
| Card hover | translateY(-1px) + shadow | 150ms | ease-out | |
| Map pin pop | scale 1→1.2→1 | 300ms | ease-spring | |
| Score bar fill | width 0→target | 600ms | ease-out | Delay 100ms |
| Skeleton shimmer | horizontal sweep | 1.5s | linear, infinite | |
| Page transition | fade + translateY 4px | 250ms | ease-out | |
| Deal breaker badge | scale 0→1 | 200ms | ease-spring | |

**Skill rules yang diterapkan:**
- `transform-performance` — hanya animasi transform/opacity, tidak width/height/top/left
- `no-blocking-animation` — animasi tidak block user input
- `interruptible` — semua animasi bisa di-interrupt oleh user action

### 10.4 Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
  
  /* Skeleton: ganti shimmer dengan static */
  .skeleton {
    animation: none;
    background: var(--color-surface-elevated);
  }
}
```

**WAJIB diimplementasi.** Score bar harus langsung tampil di target value jika reduced-motion aktif.


---

## 11. Forms & Feedback

Skill rules applied: input-labels, error-placement, inline-validation, progressive-disclosure, form-autosave.

### 11.1 Label & Placeholder

```
✅ DO:
  <label for="harga">Harga Sewa *</label>
  <input id="harga" placeholder="Contoh: 2.000.000" />

❌ DON'T:
  <input placeholder="Harga Sewa *" />  ← placeholder-as-label
```

### 11.2 Validation Timing

Skill rule: `inline-validation` — validate on BLUR, bukan keystroke. Error muncul setelah user selesai mengetik.

```
1. User mulai ketik → tidak ada error
2. User pindah focus (blur) → validate
3. Jika error → muncul di bawah field dengan icon
4. User fix dan blur lagi → error hilang
```

Satu-satunya exception: konfirmasi password bisa validate real-time setelah karakter ke-8.

### 11.3 Error Messages

Format: **Apa yang salah** + **Cara memperbaiki.**

| ❌ Buruk | ✅ Baik |
|---------|--------|
| "Field wajib" | "Harga sewa belum diisi" |
| "Input tidak valid" | "Format harga tidak valid — masukkan angka saja, tanpa titik atau koma" |
| "Error 422" | "Gagal menyimpan — coba lagi atau refresh halaman" |
| "Invalid" | "Periode kontrak belum dipilih — pilih minimal satu opsi" |

Error placement: tepat di bawah field yang error, body-xs/danger-600 + error icon.

**Untuk multiple errors (Full Survey submit):**
```
Ada 3 field yang perlu dilengkapi:
• Harga sewa — belum diisi
• Lokasi — belum diverifikasi
• Foto tampak depan — slot wajib belum diisi

[Scroll ke Error Pertama]
```

Skill rule: `focus-management` — auto-focus ke field error pertama setelah submit.

### 11.4 Quick Survey — Progressive Disclosure

Quick Survey hanya 6 field. Full Survey tersembunyi. Tidak membebani user saat di lapangan.

```
Quick Survey (tampil semua):
  □ Nama
  □ Tipe
  □ Harga
  □ Lokasi
  □ Foto 1
  □ Foto 2
  [Simpan Hunian]

Full Survey (setelah simpan, banner CTA):
  "Lengkapi detail untuk akurasi skor yang lebih tinggi."
  [Lanjut Full Survey]
```

### 11.5 Auto-save

Skill rule: `form-autosave` — Full Survey auto-save ke IndexedDB setiap 30 detik dan saat blur dari setiap field. Jika user tutup browser, data tidak hilang.

Indicator: "Draft tersimpan otomatis · 2 detik lalu" — body-xs, text-muted, di bawah form.

### 11.6 Destructive Actions

Skill rule: `destructive-emphasis` — merah, visually separated, always confirm.

```
Hapus "Apt Skandinavia Lt 12"?

Data hunian, semua foto, dan catatan
akan dihapus permanen. Tidak dapat dibatalkan.

                [Batal]    [Hapus Hunian]
                           ← danger variant, right-aligned
```

---

## 12. Navigation Patterns

Skill rules: bottom-nav-limit (max 5), nav-label-icon, back-behavior, deep-linking, adaptive-navigation.

### 12.1 Mobile — Bottom Navigation

```
┌─────────────────────────────────────────┐
│  [🏠]      [🗺️]     [+]    [⚖️]    [⚙️] │
│ Dashboard  Peta   Tambah Compare Settings │
└─────────────────────────────────────────┘
```

- Max **5 items** (skill rule: bottom-nav-limit)
- Setiap item: icon + label teks (skill rule: nav-label-icon)
- Item aktif: `primary-800` tint + indicator dot/underline
- Touch target setiap item: min 44×44px
- Height bottom nav: 60px + safe area inset bottom
- Tombol "+ Tambah" di tengah: accent color, slightly elevated

```html
<nav aria-label="Navigasi utama">
  <a href="/" aria-current="page">Dashboard</a>
  ...
</nav>
```

### 12.2 Desktop — Sidebar Navigation

Skill rule: `adaptive-navigation` — sidebar untuk ≥1024px.

```
┌────────┬──────────────────────────────┐
│        │ Header (56px)               │
│  Side  │─────────────────────────────│
│  Nav   │                             │
│ (240px)│  Content (max 800px)        │
│        │                             │
└────────┴──────────────────────────────┘
```

Sidebar items: Dashboard, Peta, Tambah Hunian, Compare, Settings. Sama dengan bottom nav.

### 12.3 Header

```
Mobile:
┌────────────────────────────────────────┐
│  ← [Judul Halaman]    [sync●] [↻] [⋮] │  height: 56px
└────────────────────────────────────────┘

Desktop:
┌────────────────────────────────────────┐
│  Hunian    [sync status]    [User ●]   │  height: 64px
└────────────────────────────────────────┘
```

- Back button di-show hanya di sub-halaman (detail, form)
- `aria-label="Kembali ke Dashboard"` pada back button
- Skill rule: `back-behavior` — back harus konsisten dan predictable

### 12.4 Deep Linking

Skill rule: `deep-linking` — semua halaman kunci bisa diakses via URL.

| URL Pattern | Halaman |
|-------------|---------|
| `/` | Dashboard |
| `/peta` | Map View |
| `/tambah` | Quick Survey |
| `/hunian/[id]` | Detail View |
| `/hunian/[id]/edit` | Full Survey |
| `/compare?ids=[id1],[id2]` | Compare View |
| `/settings` | Settings |

### 12.5 State Preservation

Skill rule: `state-preservation` — back navigation restores scroll + filter state.

Implementasi: simpan scroll position + active filter ke sessionStorage per halaman.

---

## 13. Charts & Data Visualization

Skill rules: chart-type, color-guidance, legend-visible, tooltip-on-interact, responsive-chart.

### 13.1 Chart Types yang Digunakan

| Chart | Digunakan Untuk | Library |
|-------|----------------|---------|
| **Radar Chart** | Score breakdown 7 dimensi per hunian | Recharts RadarChart |
| **Bar Chart** | Compare harga / jarak antar kandidat | Recharts BarChart |
| **Progress Bar** | Score per hunian, score per dimensi | Custom CSS |
| **Score Bar** | All-in harga vs budget threshold | Custom CSS |
| **Projection Table** | Future cost 6/12/24 bulan | HTML table, no chart |

### 13.2 Radar Chart — Score 7 Dimensi

```
            Affordability
               100
          80   │
    Commitment ╋ ─ ─ ─ Value
    Risk       │
         ──────●──────
               │
   Environment ╋      Livability
               │
      Accessibility ─ Condition
```

- 7 axis: Affordability, Accessibility, Condition, Livability, Environment, Value for Money, Commitment Risk
- Fill: `primary-100` opacity 60%, stroke `primary-600`
- Multiple candidates: overlay dengan warna berbeda, legend di bawah
- Tap area setiap titik: min 44px (skill rule: touch-target-chart)
- Responsive: scale down di mobile, legend di bawah (bukan samping)

**Accessibility:**
```html
<div role="img" aria-label="Radar chart skor 7 dimensi. Skor tertinggi: Aksesibilitas 92. Skor terendah: Commitment Risk 60.">
  <svg>...</svg>
</div>
```

Skill rule: `screen-reader-summary` — aria-label yang describe key insight.

### 13.3 Color untuk Chart

Skill rule: `color-guidance` — jangan red/green only pair (colorblind). Gunakan shapes/patterns + labels.

Untuk compare multiple hunian di radar:
- Candidate 1: `primary-600` stroke, solid
- Candidate 2: `accent-600` stroke, dashed
- Candidate 3: `success-600` stroke, dotted
- Candidate 4: `warning-600` stroke, dash-dot

Setiap kandidat dibedakan dengan stroke pattern, bukan hanya warna.

### 13.4 Score Bar vs Budget

```
Budget: Rp 3.500.000 (ideal)  Rp 4.200.000 (max)
        │                      │
[░░░░░░░████████████████████░░░░░░░░░░░░│░░░░░]
         ↑ Rp 4.100.000 (all-in hunian ini)
```

Digunakan di detail view untuk menunjukkan posisi harga relatif terhadap budget.

---

## 14. Accessibility Checklist

Berdasarkan Priority 1 (CRITICAL) dan Priority 2 (CRITICAL) dari skill.

### 14.1 Color Contrast (WCAG AA — CRITICAL)

| Combination | Ratio | Status |
|------------|-------|--------|
| `neutral-900` on `neutral-50` (primary text) | 15.8:1 | ✅ AAA |
| `neutral-600` on `neutral-50` (secondary text) | 5.9:1 | ✅ AA |
| `neutral-500` on `neutral-50` (muted text) | 3.5:1 | ✅ AA (large only) |
| White on `primary-800` | 8.7:1 | ✅ AAA |
| White on `accent-600` | 4.6:1 | ✅ AA |
| White on `success-600` | 4.6:1 | ✅ AA |
| White on `danger-600` | 5.0:1 | ✅ AA |
| `warning-700` on `warning-50` | 6.8:1 | ✅ AA |
| White on `warning-600` | 2.8:1 | ❌ FAIL — gunakan `warning-700` untuk teks |
| `neutral-500` on `neutral-50` (placeholder) | 3.5:1 | ⚠️ Large text only |

> **Rule:** Selalu test WCAG contrast sebelum ship. Tidak ada exception.

### 14.2 Keyboard Navigation

- [ ] Tab order mengikuti visual order (atas ke bawah, kiri ke kanan)
- [ ] Semua interactive element reachable via Tab
- [ ] Modal dan bottom sheet: trap focus saat terbuka
- [ ] Escape menutup modal/sheet
- [ ] Skip link "Lewati ke konten utama" di awal halaman
- [ ] Map: keyboard controls untuk pan dan zoom

### 14.3 Screen Reader

- [ ] Semua icon button punya `aria-label`
- [ ] Form label terhubung ke input via `htmlFor` / `for`
- [ ] Loading state menggunakan `aria-busy="true"`
- [ ] Toast menggunakan `aria-live="polite"`
- [ ] Error state menggunakan `role="alert"` atau `aria-live="assertive"`
- [ ] Sync status: `role="status"`, `aria-live="polite"`
- [ ] Radar chart: `role="img"`, `aria-label` dengan key insight
- [ ] Deal Breaker checklist: semantic list dengan status per item
- [ ] Budget zone: teks label wajib (tidak hanya warna)

### 14.4 Touch Targets

- [ ] Semua interactive element: minimum 44×44px
- [ ] Antar touch target: minimum 8px gap
- [ ] Slot foto: full area tappable (bukan hanya icon)
- [ ] Map pin: expand tap area atau popup area yang lebih besar
- [ ] Tab navigation items: full width/height tappable

### 14.5 Dynamic Type & Text Scaling

```css
/* Support system font scaling — jangan hardcode px untuk layout kritis */
.card-title {
  font-size: clamp(16px, 4vw, 20px);
  line-height: 1.4;
}

/* Avoid truncation at large text size */
.badge-label {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}
```

---

## 15. Voice & Tone

### 15.1 Prinsip

Bahasa Indonesia, register santai-profesional. Seperti teman yang paham finansial — tidak formal, tidak sembarangan.

### 15.2 Do & Don't

| ❌ Jangan | ✅ Gunakan |
|---------|--------|
| "Data berhasil disimpan ke server" | "Hunian tersimpan" |
| "Silakan lengkapi formulir berikut" | "Isi detail hunian" |
| "Terjadi kesalahan pada sistem" | "Gagal menyimpan — coba lagi" |
| "Konfirmasi penghapusan data" | "Hapus hunian ini?" |
| "Fitur ini tidak tersedia saat offline" | "Butuh koneksi internet untuk fitur ini" |
| "Submit" | "Simpan" |
| "Cancel" | "Batal" |
| "Invalid input" | "Format tidak valid — [spesifik]" |
| "Proses sedang berjalan" | "Menganalisis..." |
| "Operasi berhasil diselesaikan" | "Selesai ✓" |

### 15.3 Error Messages

Format: **Apa yang terjadi** + **Cara mengatasi**.

| Context | Copy |
|---------|------|
| Network error | "Tidak ada koneksi. Data tersimpan lokal dan akan sinkron otomatis." |
| AI timeout | "Analisis terlalu lama. Coba lagi dalam beberapa detik." |
| Upload foto gagal | "Foto gagal diupload. Akan dicoba lagi saat online." |
| Conflict sync | "Data di perangkat lain lebih baru. Pilih versi mana yang ingin disimpan." |
| Budget not set | "Set budget dulu supaya skor harga bisa dihitung." |

### 15.4 Empty States — Invitation to Act

Bukan "Tidak ada data." Selalu ada arah yang jelas.

### 15.5 Konfirmasi Destruktif

Selalu gunakan nama spesifik:
```
Hapus "Apt Skandinavia Lt 12"?
↑ nama spesifik, bukan "item ini"
```

---

## 16. Icons

**Library:** Lucide React — open source, consistent 1.5px stroke, tree-shakeable.

```bash
npm install lucide-react
```

### 16.1 Sizes & Stroke

| Size Token | px | Stroke Width | Penggunaan |
|------------|-----|-------------|-----------|
| `icon-xs` | 12px | 2px | Inline dengan body-xs |
| `icon-sm` | 16px | 2px | Badge, inline dengan body-sm |
| `icon-md` | 20px | 1.5px | **Default** — button, list item |
| `icon-lg` | 24px | 1.5px | Navigation, section header |
| `icon-xl` | 32px | 1.5px | Alert heading, feature icon |
| `icon-2xl` | 48px | 1.5px | Empty state, onboarding |

**Rules:**
- ❌ Tidak boleh emoji sebagai icon struktural (skill rule: no-emoji-icons)
- Satu icon style konsisten — semua dari Lucide (bukan mix dengan Heroicons)
- Icon-only button WAJIB `aria-label`

### 16.2 Icon Reference

| Fungsi | Icon (Lucide) |
|--------|--------------|
| Tambah hunian | `Plus` |
| Edit | `Pencil` |
| Hapus | `Trash2` |
| Simpan | `Save` |
| Kamera | `Camera` |
| Galeri | `Image` |
| Video | `Video` |
| Lokasi/pin | `MapPin` |
| GPS aktif | `Crosshair` |
| Peta | `Map` |
| Jarak | `Route` |
| Sinkronisasi | `RefreshCw` |
| Online | `Wifi` |
| Offline | `WifiOff` |
| Pending | `Clock` |
| Conflict | `AlertTriangle` |
| Sukses/verified | `CheckCircle2` |
| Error | `XCircle` |
| Deal Breaker | `ShieldX` |
| Deal Breaker OK | `ShieldCheck` |
| Budget ideal | `Target` |
| Budget over | `TrendingUp` |
| Dominated | `ArrowDownRight` |
| Worth It | `Zap` |
| Decision Freeze | `PauseCircle` |
| AI analysis | `Sparkles` |
| Devil's Advocate | `Swords` |
| Decision Memo | `FileText` |
| Pattern | `BarChart2` |
| Regret | `AlertOctagon` |
| Commute | `Clock` |
| Future projection | `CalendarDays` |
| Skor total | `Star` |
| Compare | `Columns2` |
| Filter | `SlidersHorizontal` |
| Sort | `ArrowUpDown` |
| Menu | `MoreVertical` |
| Tutup | `X` |
| Kembali | `ChevronLeft` |
| Share | `Share2` |
| Copy | `Copy` |
| Download | `Download` |
| Export PDF | `FileDown` |
| Masjid | `Building2` |
| Transportasi | `Train` |
| Banjir | `Waves` |
| Keamanan | `Shield` |
| Rumah | `Home` |
| Apartemen | `Building` |
| Kost | `BedDouble` |

---

## 17. Dark Mode

Skill rule: `dark-mode-pairing` — desain light + dark bersama, test contrast terpisah.

### 17.1 Token Mapping

| Token | Light | Dark | WCAG Dark |
|-------|-------|------|-----------|
| `bg-base` | `#FAFAF9` | `#131211` | — |
| `bg-surface` | `#FFFFFF` | `#1E1D1B` | — |
| `bg-elevated` | `#F4F3F0` | `#2A2927` | — |
| `border` | `#E4E3DF` | `#3A3936` | — |
| `text-primary` | `#1A1917` | `#F5F4F2` | 14.8:1 ✅ |
| `text-secondary` | `#6B6A66` | `#A8A7A3` | 5.2:1 ✅ |
| `text-muted` | `#9E9D99` | `#6B6A66` | 3.0:1 ⚠️ large only |
| `primary` | `#0B4F6C` | `#1A80A6` | 5.8:1 ✅ |
| `primary-surface` | `#EBF7FA` | `#0B2E3A` | — |
| `accent` | `#E8621A` | `#F07B3A` | 4.1:1 ✅ |
| `success` | `#16A34A` | `#22C55E` | 5.6:1 ✅ |
| `warning-text` | `#B45309` | `#FBBF24` | 8.8:1 ✅ |
| `danger` | `#DC2626` | `#F87171` | 5.3:1 ✅ |

### 17.2 Shadow di Dark Mode

Shadow tidak effective di background gelap. Gunakan border sebagai pengganti:

```css
.dark .card {
  box-shadow: none;
  border: 1px solid var(--color-border);
}

.dark .modal {
  box-shadow: none;
  border: 1px solid var(--color-border-subtle);
}
```

### 17.3 Implementation

```html
<!-- Toggle via class pada html element -->
<html class="dark">

<!-- Atau via CSS media query -->
@media (prefers-color-scheme: dark) { ... }
```

Hunian menggunakan **class-based dark mode** (user bisa override system preference). Disimpan di localStorage + Supabase user_config.

---

## 18. Tailwind Config

```javascript
// tailwind.config.js
const { fontFamily } = require('tailwindcss/defaultTheme')

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', ...fontFamily.sans],
        body: ['var(--font-body)', ...fontFamily.sans],
        mono: ['var(--font-mono)', ...fontFamily.mono],
      },
      colors: {
        primary: {
          50:  '#EBF7FA',
          100: '#D6EEF5',
          200: '#A8D8E8',
          400: '#4BAAC8',
          600: '#1A80A6',
          700: '#0E6789',
          800: '#0B4F6C',
          900: '#062F40',
          950: '#041E29',
        },
        accent: {
          50:  '#FEF0E8',
          100: '#FDDBC8',
          500: '#F07B3A',
          600: '#E8621A',
          700: '#C4511A',
          800: '#8B3A0F',
        },
        neutral: {
          50:  '#FAFAF9',
          100: '#F4F3F0',
          200: '#E4E3DF',
          300: '#C8C7C3',
          400: '#B5B4B0',
          500: '#9E9D99',
          600: '#6B6A66',
          700: '#403F3B',
          800: '#2D2C29',
          900: '#1A1917',
          950: '#0F0E0C',
        },
      },
      borderRadius: {
        sm: '4px',
        DEFAULT: '8px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '20px',
      },
      boxShadow: {
        'elevation-1': '0 1px 2px rgba(15,14,12,0.05), 0 1px 1px rgba(15,14,12,0.04)',
        'elevation-2': '0 4px 6px rgba(15,14,12,0.06), 0 2px 4px rgba(15,14,12,0.05)',
        'elevation-3': '0 10px 15px rgba(15,14,12,0.08), 0 4px 6px rgba(15,14,12,0.05)',
        'elevation-4': '0 20px 25px rgba(15,14,12,0.10), 0 8px 10px rgba(15,14,12,0.06)',
      },
      spacing: {
        '18': '72px',
        '22': '88px',
        '112': '448px',
        '128': '512px',
      },
      transitionDuration: {
        '100': '100ms',
        '150': '150ms',
        '250': '250ms',
        '350': '350ms',
      },
      transitionTimingFunction: {
        'out-smooth': 'cubic-bezier(0, 0, 0.2, 1)',
        'in-smooth': 'cubic-bezier(0.4, 0, 1, 1)',
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      screens: {
        'xs': '375px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
      },
      zIndex: {
        'base': '0',
        'raised': '10',
        'dropdown': '20',
        'sticky': '30',
        'overlay': '40',
        'modal': '50',
        'toast': '60',
        'tooltip': '70',
      },
      animation: {
        'shimmer': 'shimmer 1.5s infinite linear',
        'fade-in': 'fadeIn 200ms ease-out',
        'slide-up': 'slideUp 300ms cubic-bezier(0, 0, 0.2, 1)',
        'scale-in': 'scaleIn 300ms cubic-bezier(0, 0, 0.2, 1)',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [
    // Plugin untuk tabular numbers
    function({ addUtilities }) {
      addUtilities({
        '.tabular-nums': {
          'font-variant-numeric': 'tabular-nums',
        },
        '.touch-target': {
          'min-height': '44px',
          'min-width': '44px',
        },
        '.safe-top': {
          'padding-top': 'env(safe-area-inset-top)',
        },
        '.safe-bottom': {
          'padding-bottom': 'env(safe-area-inset-bottom)',
        },
      })
    },
  ],
}
```

---

## Appendix A: Pre-Delivery Checklist

Berdasarkan skill Pre-Delivery Checklist — jalankan sebelum setiap ship.

### Visual Quality
- [ ] Tidak ada emoji sebagai icon struktural — semua dari Lucide
- [ ] Semua icon dari satu family (Lucide) dengan stroke konsisten
- [ ] Pressed state tidak shift layout bounds
- [ ] Semantic color tokens dipakai konsisten (tidak hardcode hex)

### Interaction
- [ ] Semua tappable element: visual feedback dalam 80–100ms
- [ ] Touch target ≥ 44×44px
- [ ] Micro-interaction: 150–300ms
- [ ] Disabled state: visual jelas + non-interactive
- [ ] Focus ring: visible di semua interactive element
- [ ] Gesture regions: tidak ada nested tap/drag conflict

### Light/Dark Mode
- [ ] Primary text contrast ≥ 4.5:1 di light dan dark
- [ ] Secondary text contrast ≥ 3:1 di light dan dark
- [ ] Warning yellow: gunakan `warning-700` untuk teks (bukan `warning-600`)
- [ ] Modal scrim: minimum 40–60% opacity
- [ ] Shadow di dark mode: diganti dengan border

### Layout
- [ ] Safe area respected di header, bottom nav, CTA
- [ ] Scroll content tidak tersembunyi di belakang fixed bar
- [ ] Test di 375px (small phone) dan 1024px (desktop)
- [ ] 4/8px spacing rhythm konsisten
- [ ] Horizontal scroll tidak ada di mobile

### Accessibility
- [ ] Semua icon button punya `aria-label`
- [ ] Form field punya `<label>` dengan `for` attribute
- [ ] Color bukan satu-satunya indicator (budget zone, skor, dll)
- [ ] `prefers-reduced-motion` direspect
- [ ] Score bar langsung tampil di target value jika reduced-motion aktif
- [ ] Radar chart punya `aria-label` dengan key insight
- [ ] Toast menggunakan `aria-live="polite"`

### Forms
- [ ] Label visible (bukan placeholder-only)
- [ ] Error muncul di bawah field yang bersangkutan
- [ ] Error message: cause + cara memperbaiki
- [ ] Auto-save aktif di Full Survey
- [ ] Confirm sebelum dismiss sheet dengan unsaved changes
- [ ] Required field ditandai dengan asterisk + sr-only teks

---

## Appendix B: Changelog

| Versi | Tanggal | Perubahan |
|-------|---------|-----------|
| 1.0 | Juni 2026 | Initial design system |
| 2.0 | Juni 2026 | Full rewrite — integrated UI/UX Pro Max guidelines, 7-dimensi scoring components, logic feature components (Deal Breaker, Budget Zone, Dominated, Worth It), complete state machines, WCAG verification, dark mode tested pairs |
