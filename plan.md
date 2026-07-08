# Hunian - Implementation Plan

## Context

Hunian adalah platform keputusan sewa hunian berbasis data untuk urban renters Indonesia (25-35 tahun). Menggabungkan structured survey, logic engine, dan AI LLM analysis. User bisa dokumentasi properti cepat (Quick Survey 30 detik), dapat scoring 7 dimensi, analisis budget dual-threshold, deteksi deal breaker, dan AI insights.

**Dokumen referensi:**
- `BRD-Hunian-v2.md` - Business requirements, constraints, business rules
- `PRD-Hunian-v2.md` - Data model (section 11), scoring formulas (section 7.4), feature map (section 18)
- `DESIGN-SYSTEM-Hunian (1).md` - Design tokens, component specs, Tailwind config (section 18)

**HTML Prototypes (6 files):**
- `Hunian Dashboard.dc.html` - Dashboard dengan budget overview, property cards, map view, bottom nav
- `Hunian Survey.dc.html` - Quick Survey (30 detik) + Full Survey (5 tab)
- `Hunian Detail.dc.html` - Detail hunian dengan 6 tab (Overview, Biaya, Kondisi, Foto, GIS, AI)
- `Hunian Compare.dc.html` - Compare view dengan radar chart, What-If slider
- `Hunian Settings.dc.html` - Settings: budget, bobot, deal breakers, sync
- `Hunian Decision Memo.dc.html` - Decision memo document

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js (App Router) + TypeScript |
| Styling | Tailwind CSS v3 |
| Fonts | Plus Jakarta Sans (display), Inter (body), JetBrains Mono (data) |
| Icons | Lucide React |
| Local Storage | IndexedDB via Dexie.js (offline-first) |
| Cloud Storage | Supabase (PostgreSQL + Storage) |
| Auth | Supabase Auth |
| AI | OpenAI GPT-4o mini |
| GIS | Overpass API, Nominatim, OpenRouteService, Leaflet |
| Charts | Recharts / SVG custom |
| State | Zustand (UI state), Dexie useLiveQuery (data state) |
| Hosting | Vercel |

---

## Design System Summary

### Colors
- **Primary**: Teal `#0B4F6C` (display, CTA, active states)
- **Accent**: Orange `#E8621A` (markers, highlights, FAB)
- **Neutrals**: Warm gray scale (`#FAFAF9` -> `#1A1917`)
- **Semantic**: Success green, Warning amber, Danger red, Info blue
- **Budget Zones**: Comfort (teal), Ideal (green), Stretch (amber), Over (red)

### Typography
- Display/heading: Plus Jakarta Sans (500-800)
- Body/UI: Inter (400-600)
- Data/prices: JetBrains Mono (400-500, tabular-nums)

### Key Design Principles
1. Data First, Never Decoration
2. Two Contexts, One System (field survey + home evaluation)
3. Honest UI (uncertainty not hidden)
4. Progressive Disclosure
5. Accessible by Default (WCAG AA)

### Responsive Breakpoints
- Mobile: 375px (baseline)
- Tablet: 768px
- Desktop: 1024px+ (sidebar 240px + content)

---

## Improvements dari HTML Prototypes

HTML prototypes sudah bagus secara visual. Yang di-improve:

1. **Responsive Layout** - Prototype fixed 390px -> fluid mobile-first, desktop sidebar
2. **Micro-interactions** - Press feedback (scale 0.97), card hover lift, animated score bars
3. **Empty States** - Prototype selalu populated -> helpful empty states + CTA
4. **Skeleton Loading** - Shimmer loading untuk semua data-dependent views
5. **Onboarding Flow** - Guided wizard untuk budget + office location setup
6. **Progressive Disclosure** - Collapsible sections dalam tab yang dense
7. **Better Form UX** - Auto-advance focus, live thousand separator, GPS loading
8. **State Preservation** - Restore scroll position + filters saat navigate back
9. **Swipe Gestures** - Horizontal swipe di Compare columns (mobile)
10. **Deal Breaker Prominence** - Persistent banner saat ada violations

---

## Project Structure

```
hunian/
  app/
    layout.tsx                    -- Root layout: fonts, theme, metadata
    globals.css                   -- CSS variables, base animations
    page.tsx                      -- Dashboard (/)
    tambah/page.tsx               -- Quick Survey (/tambah)
    hunian/[id]/page.tsx          -- Detail (/hunian/[id])
    hunian/[id]/edit/page.tsx     -- Full Survey (/hunian/[id]/edit)
    compare/page.tsx              -- Compare (/compare)
    settings/page.tsx             -- Settings (/settings)
    memo/[id]/page.tsx            -- Decision Memo (/memo/[id])
    onboarding/page.tsx           -- Budget + office wizard
    api/ai/...                    -- AI API routes
    api/gis/...                   -- GIS API routes

  components/
    ui/                           -- Atomic design system components
      Button.tsx                  -- 5 variants, 3 sizes, loading/disabled
      Input.tsx                   -- Text input with label, error states
      PriceInput.tsx              -- "Rp" prefix, thousand separator
      Chip.tsx                    -- Filter chip, segmented control
      Badge.tsx                   -- Budget zone, status, score
      Toast.tsx                   -- 4 variants, auto-dismiss
      BottomSheet.tsx             -- Slide-up, focus trap, Escape dismiss
      Skeleton.tsx                -- Shimmer animation variants
      EmptyState.tsx              -- Icon + headline + body + CTA
      ScoreBar.tsx                -- Animated 8px track
      ScoreRing.tsx               -- Conic gradient ring

    property/                     -- Domain components
      PropertyCard.tsx            -- Score bar, budget zone, badges
      BudgetZoneIndicator.tsx     -- 4-zone chip
      DealBreakerPanel.tsx        -- Pass/fail/unknown checklist
      AlertCard.tsx               -- Worth It, Warning, Decision Freeze
      PhotoSlot.tsx               -- Required/recommended/filled states
      RadarChart.tsx              -- SVG 7-axis radar
      CostBreakdown.tsx           -- Itemized cost table

    layout/                       -- Layout components
      AppShell.tsx                -- BottomNav mobile, Sidebar desktop
      BottomNav.tsx               -- 5 items + center FAB
      Sidebar.tsx                 -- 240px desktop nav
      Header.tsx                  -- Back, title, actions

    survey/                       -- Survey form components
      QuickSurveyForm.tsx
      FullSurveyTabs.tsx
      BiayaTab.tsx / KondisiTab.tsx / LingkunganTab.tsx / FotoTab.tsx / CatatanTab.tsx

  lib/
    db/                           -- Dexie.js database
      schema.ts                   -- Tables: properties, user_config, sync_queue
      properties.ts               -- Property CRUD
      user-config.ts              -- Config CRUD

    engine/                       -- Pure TypeScript logic (no React)
      budget.ts                   -- Budget zone, ratio calculation
      scoring.ts                  -- 7-dimension scoring with segmented curves
      cost-calculator.ts          -- Monthly total, upfront cost
      deal-breaker.ts             -- Rule evaluation
      dominated.ts                -- Pareto dominance detection
      worth-it.ts                 -- Worth It logic
      decision-freeze.ts          -- Analysis paralysis detection
      haversine.ts                -- Distance calculation

    hooks/                        -- React hooks wrapping db + engine
      useProperties.ts
      useProperty.ts
      useUserConfig.ts
      useScoring.ts
      useBudgetZone.ts

    sync/                         -- Cloud sync
      sync-manager.ts
      conflict-resolver.ts
      photo-uploader.ts

    supabase/                     -- Supabase clients
      client.ts / server.ts / auth.ts

    utils/
      format.ts                   -- IDR formatting, dates
      constants.ts                -- Enums, defaults, photo slot defs
      photo-compress.ts           -- Canvas API compression

  types/
    property.ts                   -- Property interfaces
    user-config.ts                -- UserConfig type
    scoring.ts                    -- ScoreBreakdown, BudgetZone enums
    deal-breaker.ts               -- DealBreakerRule type

  store/
    app-store.ts                  -- Zustand: UI state (view, filters, sheets)
```

---

## Phase 1: Foundation + Static UI

**Goal**: Next.js project initialized. Design system lengkap. 7 pages render dengan mock data. Responsive + dark mode.

### 1.1 - Project Bootstrap
- Create Next.js app with TypeScript + Tailwind + App Router
- Install: `lucide-react recharts dexie dexie-react-hooks zustand clsx date-fns zod`
- Configure `tailwind.config.ts` dari Design System section 18
- Create `globals.css` dengan CSS custom properties (light + dark)
- Setup fonts via `next/font/google`

### 1.2 - Core UI Components
Build semua atomic components (Button, Input, PriceInput, Chip, Badge, Toast, BottomSheet, Skeleton, EmptyState, ScoreBar, ScoreRing)

### 1.3 - Layout Components
Build AppShell (responsive), BottomNav (5 items + FAB), Sidebar (desktop), Header

### 1.4 - Property & Domain Components
Build PropertyCard, BudgetZoneIndicator, DealBreakerPanel, AlertCard, PhotoSlot, RadarChart, CostBreakdown

### 1.5 - Page Assembly
Assemble semua 7 pages dengan mock data:
- **Dashboard** - Budget overview, filter/sort, property list, map placeholder
- **Quick Survey** - AI shortcuts, 6 fields, photo slots
- **Full Survey** - 5 tabs per property type
- **Detail** - Hero, Devil's Advocate, 6 tabs dengan radar chart
- **Compare** - Radar overlay, What-If slider, comparison table
- **Settings** - Budget sliders, weight sliders, deal breaker builder
- **Decision Memo** - Formal document layout

### 1.6 - Dark Mode + Responsive
- Class-based toggle, localStorage persist
- Mobile/tablet/desktop breakpoints
- Safe area insets

---

## Phase 2: Data Layer + Logic Engine

**Goal**: IndexedDB stores real data. Logic engine calculates scores, zones, deal breakers real-time.

### 2.1 - Dexie.js Database Schema
Tables: properties, user_config, sync_queue, ai_outputs, gis_cache

### 2.2 - Logic Engine (Pure Functions)
- `budget.ts` - calculateBudgetZone(), calculateBudgetRatio()
- `scoring.ts` - 7-dimension scoring (affordability segmented curve dari PRD 7.4)
- `cost-calculator.ts` - calculateMonthlyTotal(), calculateUpfrontCost()
- `deal-breaker.ts` - evaluateDealBreakers()
- `dominated.ts` - findDominatedProperties() (Pareto)
- `worth-it.ts` - evaluateWorthIt()

### 2.3 - React Hooks
Wrap Dexie useLiveQuery + engine functions untuk reactive data

### 2.4 - Wire Data ke UI
Replace mock data dengan live queries. Real-time score recalculation.

---

## Phase 3: Auth + Cloud Sync + Photos

### 3.1 - Supabase Setup
PostgreSQL tables, RLS policies, Storage bucket

### 3.2 - Authentication
Supabase Auth (magic link), login/signup page, auth middleware

### 3.3 - Sync Manager
Sync triggers (app launch, online, focus, interval, manual). Queue-based, conflict detection.

### 3.4 - Photo Pipeline
Canvas compression (max 500KB), OPFS local, Supabase Storage upload

### 3.5 - Onboarding Wizard
Budget setup + office location pada first login

---

## Phase 4: AI Features + Map View

### 4.1 - AI API Routes
- `/api/ai/extract-text` - GPT-4o mini text-to-form
- `/api/ai/extract-url` - Jina AI + LLM URL extraction

### 4.2 - AI UI Integration
Paste deskripsi/URL modals, field confidence highlighting

### 4.3 - Leaflet Map
react-leaflet, score-colored pins, office pin, popup, dynamic import

### 4.4 - GPS + Location
Geolocation API, Google Maps link parser, Nominatim geocoding

---

## Phase 5: Polish + Advanced

### 5.1 - Compare Interactivity
Property selection, real-time What-If recalculation

### 5.2 - Decision Memo Generation
AI generates memo, print-optimized export

### 5.3 - Production Polish
Page transitions, skeletons, empty states, keyboard nav, WCAG audit, error boundaries

---

## Phase 6: GIS + Advanced AI (v1.1-v1.3)

### 6.1 - GIS API Routes
POI Radar (Overpass), Walkability/Transit scores, cache in IndexedDB

### 6.2 - Advanced GIS
Flood susceptibility, Noise risk, Isochrone maps

### 6.3 - Advanced AI
Smart Notes, Contextual Checklists, Neighborhood Intelligence, Negotiation Scripts

---

## Key Business Rules (dari BRD)

- **BU-008**: Deal breaker field yang unknown = bukan pass/fail, tampilkan "Belum diisi"
- **BU-011**: Dominated properties tidak auto-removed, hanya ditandai opacity rendah
- **BU-014**: Semua output AI dilabeli sebagai estimasi, bukan nasihat finansial
- **BU-020**: Sync tidak boleh silent overwrite - conflict harus ditampilkan ke user
- **BU-001**: Semua harga wajib per bulan, konversi otomatis jika input tahunan

---

## Key Scoring Algorithm Reference

Affordability segmented curve (dari `Hunian Compare.dc.html`):
```
afford(allIn, ideal, max):
  if allIn < ideal*0.7  -> 100 (comfort)
  if allIn <= ideal      -> 100 - (allIn-ideal*0.7)/(ideal*0.3)*25  (100->75)
  if allIn <= max        -> 75 - (allIn-ideal)/(max-ideal)*35       (75->40)
  if allIn <= max*1.3    -> 40 - (allIn-max)/(max*0.3)*40           (40->0)
  else                   -> 0
```

Default weights: Affordability 25%, Accessibility 20%, Condition 15%, Livability 15%, Environment 10%, Value 10%, Commitment 5%

---

## SSR Safety Notes

- **Dexie.js** requires browser APIs (IndexedDB). Semua db operations di `'use client'` components
- **Leaflet** manipulates DOM. Use `dynamic(() => import(...), { ssr: false })`
- **Theme**: Read localStorage in `useEffect`, not during SSR
- **Zustand**: Initialize with default values, hydrate from IndexedDB on mount
