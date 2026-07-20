# MedTechPreneurs.com — Brand / Visual Extraction Brief

**Source:** https://medtechpreneurs.com/  
**Fetched:** 2026-07-16 via `curl` (no browser / no JS execution)  
**Artifacts saved locally for inspection:**
- `/tmp/medtechpreneurs-source.html` (document shell)
- `/tmp/medtechpreneurs-index.css` (`/assets/index-CrM5Fc--.css`)
- `/tmp/medtechpreneurs-fonts.css` (Google Fonts CSS for Montserrat)
- `/tmp/medtechpreneurs-index.js` (`/assets/index-Bah6jnHu.js`)

This document is a **factual extraction** of what appears in those files. It is **not** a design recommendation for Splice.

---

## 0. Critical limitation: JS-rendered SPA

The HTML returned for `/` is a thin shell (~1.3 KB). Body content is only:

```html
<div id="root"></div>
```

There are **no server-rendered sections, headlines, or inline styles** in the HTML. Visible UI is painted by the client JS bundle.

Therefore:
- **Colors, fonts, radii, CSS variables** below come from the linked CSS (and font CSS) — these are reliable.
- **Page structure, tone of voice, imagery filename cues** below come from **string literals inside the JS bundle**, not from a rendered DOM. Ordering is approximate (first-occurrence order in the minified bundle), not a guarantee of final scroll order after runtime composition.

---

## 1. Framework / stack signals

| Signal | Evidence |
|---|---|
| **Vite + React SPA** | Script `/assets/index-Bah6jnHu.js`, stylesheet `/assets/index-CrM5Fc--.css`, `createRoot` in JS, `VITE_SUPABASE_*` env strings |
| **React Router** | Runtime error strings: “Index routes must not have child routes”, “React Router caught the following error…” |
| **Tailwind CSS** | Full Tailwind preflight + utility CSS in the stylesheet |
| **shadcn/ui-style tokens** | `:root` / `.dark` HSL CSS variables (`--background`, `--primary`, `--sidebar-*`, `--radius`, etc.) + Radix references in JS (`radix`) |
| **Lucide icons** | `lucide-react` string + SVG path data in JS |
| **Supabase** | `@supabase` / `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` / Realtime / Edge Function strings |
| **Motion library** | Animation runtime strings (spring duration, cubic bezier, “Mini animate()…”) — consistent with Framer Motion or similar; not Next.js |
| **Not Next.js / Webflow** | No `__NEXT_DATA__`, no Webflow classes; title/meta live in static HTML head |
| **External image hosts referenced in JS** | `https://framerusercontent.com/images/...`, `cdn-ecommerce/store_.../assets/...` |

**Implication for replication:** Visual system is a **dark, Tailwind + CSS-variable design system** (custom brand tokens layered on shadcn-like defaults), not a Webflow template. Same stack family as Splice’s Next.js + Tailwind setup is realistic; pixel-for-pixel Webflow export is not involved.

---

## 2. Fonts

### Linked in HTML
```
https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap
```

### Declared weights in Google Fonts CSS
Montserrat: **400, 500, 600, 700, 800, 900**

### Applied in site CSS
| Rule | Declaration |
|---|---|
| `body` | `font-family: Montserrat, sans-serif` |
| `h1, h2, h3, h4, h5, h6` | `font-family: Montserrat, sans-serif; font-weight: 900` |
| `.font-montserrat` | `font-family: Montserrat, sans-serif` |

**Also present (Tailwind defaults, not brand-specific):**
- `ui-sans-serif, system-ui, sans-serif, …` (preflight on `html`)
- `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, …` (mono stack)

**Heading vs body:** Same family (Montserrat) for both; headings forced to **weight 900**.

---

## 3. Color palette

### 3a. Custom brand tokens (from `:root` CSS variables)

Values are stored as **space-separated HSL components** (shadcn pattern): `H S% L%`.  
Hex values below are **conversions** of those HSL components (not separate hex literals in the token definitions).

| Token name | CSS value (`H S% L%`) | Converted hex |
|---|---|---|
| `--deep-purple` | `289 82% 15%` | `#3A0746` |
| `--neon-purple` | `274 100% 50%` | `#9000FF` |
| `--neon-yellow` | `66 100% 50%` | `#E6FF00` |
| `--deep-navy` | `226 63% 11%` | `#0A132E` |
| `--teal-green` | `180 100% 40%` | `#00CCCC` |
| `--tech-blue` | `193 72% 59%` | `#4BC1E2` |
| `--dark-abyss` | `230 60% 4%` | `#040610` |
| `--royal-purple` | `274 84% 18%` | `#330754` |
| `--chartreuse` | `71 100% 56%` | `#D6FF1F` |
| `--gold` | `45 100% 51%` | `#FFC105` |

**Usage frequency in the JS class strings (brand utilities):**
- `teal-green` — very high (~142 matches)
- `neon-yellow` (~38), `deep-navy` (~37), `neon-purple` (~31)
- `deep-purple`, `chartreuse`, `royal-purple` — lower
- `gold`, `dark-abyss`, `tech-blue` — defined in CSS; little/no class usage found in the JS string scan

### 3b. Semantic shadcn-style tokens

**`:root` (light defaults in CSS):**

| Token | HSL components | Converted hex |
|---|---|---|
| `--background` | `0 0% 100%` | `#FFFFFF` |
| `--foreground` | `222.2 84% 4.9%` | `#020817` |
| `--primary` | `289 82% 15%` | `#3A0746` (= deep-purple) |
| `--primary-foreground` | `0 0% 100%` | `#FFFFFF` |
| `--secondary` | `210 40% 96.1%` | `#F1F5F9` |
| `--secondary-foreground` | `222.2 47.4% 11.2%` | `#0F172A` |
| `--muted` | `210 40% 96.1%` | `#F1F5F9` |
| `--muted-foreground` | `215.4 16.3% 46.9%` | `#64748B` |
| `--accent` | `274 100% 50%` | `#9000FF` (= neon-purple) |
| `--accent-foreground` | `0 0% 100%` | `#FFFFFF` |
| `--destructive` | `0 84.2% 60.2%` | `#EF4444` |
| `--border` / `--input` | `214.3 31.8% 91.4%` | `#E2E8F0` |
| `--ring` | `274 100% 50%` | `#9000FF` |

**`.dark` overrides (marketing UI leans on these — heavy `text-white` / `bg-deep-navy` usage in JS):**

| Token | HSL components | Converted hex |
|---|---|---|
| `--background` | `226 63% 11%` | `#0A132E` (= deep-navy) |
| `--foreground` | `0 0% 100%` | `#FFFFFF` |
| `--primary` | `274 100% 50%` | `#9000FF` |
| `--accent` | `66 100% 50%` | `#E6FF00` (= neon-yellow) |
| `--accent-foreground` | `226 63% 11%` | `#0A132E` |
| `--secondary` / `--muted` / `--border` / `--input` | `217.2 32.6% 17.5%` | `#1E293B` |
| `--muted-foreground` | `215 20.2% 65.1%` | `#94A3B8` |
| `--destructive` | `0 62.8% 30.6%` | `#7F1D1D` |

`body` rule: `background-color: hsl(var(--background)); color: hsl(var(--foreground));`

### 3c. Distinct hex / rgb literals found in CSS (raw)

| Value | Notes |
|---|---|
| `#FFFFFF` / `#FFF` | White |
| `#1A0838` | Also used as `bg-[#1a0838]` in JS; `rgb(26 8 56)` |
| `#22D3EE` | Literal in CSS |
| `#9CA3AF` | Gray |
| `#CCCCCC` / `#CCC` | Gray |
| `#DC2626` | Red |
| `#E5E7EB` | Border gray (Tailwind default border color in preflight) |
| `#F87171` (+ alpha suffixes `1a`, `4d`) | Red-400 variants |
| `#000000` (+ alpha suffixes) | Black overlays |
| `#FFFFFF` (+ alpha suffixes `0d`, `1a`, `4d`, `80`, `b3`, `e6`) | White overlays |
| `rgb(59 130 246 / .5)` | Tailwind default ring blue (preflight), not a brand token |
| `rgba(0,204,204,.08/.1/.3/.5/.6)` | Teal-green overlays → `#00CCCC` |
| `rgba(209,240,0,.3)` | Yellow-green overlay → `#D1F000` |
| `rgba(123,63,242,.1)` | Purple overlay → `#7B3FF2` |
| `rgba(255,215,0,.1)` | Gold overlay → `#FFD700` |
| `rgba(64,224,208,.1)` | Turquoise overlay → `#40E0D0` |
| `rgba(255,255,255,.02)` | Noise texture |
| `rgba(0,0,0,.8)` | Dark overlay |

### 3d. Additional hardcoded colors in JS (not only CSS tokens)

| Value | Context |
|---|---|
| `#00CCCC` | Matches `--teal-green` |
| `#9D4EDD` | Purple accent literal |
| `#1A0838` | Dark purple background literal |
| `rgba(0,255,255,…)` | Pure cyan `#00FFFF` glows |
| `rgba(20, 30, 48, 0.9)` | `#141E30` |
| `rgba(10, 12, 20, 0.95)` | `#0A0C14` |
| `rgba(41, 22, 79, …)` | `#29164F` |

### 3e. Custom CSS color utilities / effects (named)

- `.gradient-overlay-left` → `linear-gradient(to right, hsl(var(--deep-purple)) 0%, transparent 100%)`
- `.noise-texture` → repeating diagonal lines with `rgba(255,255,255,.02)`
- Brand utility classes wired to tokens, e.g. `.text-teal-green`, `.bg-neon-yellow`, `.bg-deep-navy`, `.text-neon-purple`, `.text-chartreuse`, etc.

---

## 4. Spacing, radius, visual tone cues (from CSS + class usage)

### Radius
| Token / utility | Value |
|---|---|
| `--radius` | `.5rem` (8px) |
| Derived | `calc(var(--radius) - 2px)`, `calc(var(--radius) - 4px)` |
| Utilities present | `rounded`, `rounded-sm`, `rounded-md`, `rounded-lg`, `rounded-xl`, `rounded-2xl`, `rounded-full`, plus corner variants |
| Other literals in CSS | `2px`, `.75rem`, `1rem`, `1.5rem`, `9999px` |

Overall: **moderately rounded** (8px base), not sharp-rect / newspaper, not pill-everything — though `rounded-full` exists for chips/avatars.

### Hard offset shadows (from JS class strings)
Neo-brutalist-adjacent colored offsets appear:
- `4px_4px_0px_rgba(0,204,204,0.3)` / `6px_6px_0px_rgba(0,204,204,0.3)`
- `4px_4px_0px_rgba(209,240,0,0.3)` / `6px_6px_0px_rgba(209,240,0,0.3)`

Soft glows also present, e.g. `0_20px_60px_rgba(0,204,204,0.08)`, `0_0_10px_rgba(0,204,204,0.5)`.

### Spacing tone (most common utilities in JS)
High-frequency section padding: `py-16`, `py-20`, `py-24`  
Common gaps/margins: `mb-4`, `mb-6`, `mb-8`, `mb-12`, `gap-2`–`gap-6`, `px-4`–`px-12`, `p-6`/`p-8`  

Overall: **generous vertical section spacing**, denser control padding inside cards/forms.

### Other body behavior
- `overflow-x: hidden`
- `scroll-behavior: smooth`
- Custom scrollbar hiding on `body`

---

## 5. Page structure (from JS string order — approximate)

HTML meta describes the live campaign focus:

- **Title:** `MedTechPreneurs' 2026 | Connecting Medical Technology Enterpreneurs and Medical Experts`
- **Description:** Pitch competition / roadshow at Hyderabad MBBS colleges, 25 Mar – 25 Apr 2026

Approximate content blocks inferred from first-occurrence order of marketing strings in the JS bundle:

1. **Campaign hero / identity** — `MedTechPreneurs' 2026`, `ROADSHOW 2026 / 25 MAR - 25 APR`
2. **Positioning** — `Bridge the Gap` / `Technology & Healthcare`
3. **Primary CTAs** — `Join Splice+`, `Join Roadshow`
4. **Value pillars** — `INITIATE • FUND • DEPLOY`, `Medical Innovation`, `Strategic Capital`, `Premier Platform`
5. **Audience / offer** — startups / medical experts / investors; “healthcare unicorn” language
6. **Campus Roadshow** + college cards (Gandhi, Osmania, Deccan, … NIMS, Mallareddy)
7. **Product insert: Splice+** — `MEET SPLICE+`, `Swipe. Match. Build Together.`, swipe/match/verified features
8. **Ecosystem cards** — Building Connections, Strategic Partnerships, Investor Network, Market Entry Support, Pitch Competitions, Mentorship Program
9. **Pitch competition callout** — “India's 1st Pitch Competition…”
10. **Learning / courses** — Learning Pathways, AI-in-Healthcare course tiers
11. **Social proof** — `WHAT People SAY` + testimonial quotes
12. **Campus Ambassador** — `BE A CAMPUS`, `APPLY NOW`
13. **Footer CTAs / legal** — `PARTICIPATE NOW`, `GRAB FUNDING`, `Connect With Us`, Privacy/Terms, credit `Designed & Developed by Adil Shakeel`

Auth UI strings also exist in the same bundle (`Create Account`, `Sign in with your email and password`, `Splice+ App`, Supabase auth messages) — consistent with an app entry point on the same origin/build.

---

## 6. Tone of voice (from extracted copy)

**Register:** energetic, campaign/hype-oriented, founder-startup vernacular — not academic or clinical-formal.

**Patterns observed:**
- Short punchy lines and stacked fragments: `Bridge the Gap`, `Swipe. Match. Build Together.`, `INITIATE • FUND • DEPLOY`
- Uppercase / event-poster styling in places: `ROADSHOW 2026`, `JOIN SPLICE+`, `PARTICIPATE NOW`, `GRAB FUNDING`, `WHAT People SAY`
- Exclamation-heavy CTAs: `The Hype is REAL!!!`, `Turn Your Innovation into the Next Healthcare Unicorn!`
- Dual audience address: startups **and** medical experts / investors / campus ambassadors
- Product language for Splice+ is benefit-led and interface-specific: “Swipe right to connect, left to skip. Mutual matches unlock instant messaging”

**CTA verbs seen:** Join, Participate, Grab, Enroll, Apply, Learn More, Register Interest, Get Started, Sign up / Login.

---

## 7. Imagery / icon cues

### Asset filenames referenced in JS (local hashed assets)
- `/assets/Building%20Connections-DTvBIGE4.png`
- `/assets/Investor%20Network-BThlfy5f.png`
- `/assets/Market%20Entry%20Support-U-ElegZ_.png`
- `/assets/Mentorship%20Program-pVRIjCwg.png`
- `/assets/Pitch%20Competitions-UYDQUdbX.png`
- `/assets/Strategic%20Partnerships-jZMaWXlR.png`
- `/images/block/placeholder-dark-1.svg`

Filenames read as **concept / benefit illustrations** (connections, investors, mentorship, pitch), not product UI screenshots.

### Remote image hosts
- `https://framerusercontent.com/images/...png` (2 URLs found)
- Multiple `cdn-ecommerce/store_.../assets/*.jpg|png` paths (course/commerce imagery)

### Icons
- Lucide-style SVG path data embedded in the bundle (users, locations, navigation chevrons, etc.)
- No meaningful `alt="..."` strings were extractable from the minified JS via simple regex (alts may be missing, dynamically composed, or minified away)

---

## 8. Note relevant to Splice landing work

The **same marketing site already contains a Splice+ product section** and auth/app strings (`MEET SPLICE+`, `Join Splice+`, `Splice+ App`). A future `splice.medtechpreneurs.com` landing would be entering a brand system that already names and describes Splice+ on the parent domain — visual kinship can come from the tokens/fonts above without reusing Roadshow campaign copy.

---

## 9. Inventory checklist (what was / wasn’t available without JS render)

| Question | Status |
|---|---|
| Raw HTML fetched | Yes — SPA shell only |
| Linked CSS fetched | Yes — `/assets/index-CrM5Fc--.css` |
| Google Fonts CSS fetched | Yes — Montserrat 400–900 |
| Brand color tokens with hex | Yes — from CSS variables (+ conversions noted) |
| Font families | Yes — Montserrat for body + headings (900) |
| Radius / spacing patterns | Yes — from CSS + utility frequency in JS |
| True rendered DOM structure | **No** — requires browser/JS |
| Live computed styles / screenshots | **Not collected** in this pass |

If pixel-level confirmation of hero layout, photography treatment, or exact section sequence is needed, a headless browser render (or manual screenshot pass) would be the next research step — not inferable from the empty `#root` HTML alone.
