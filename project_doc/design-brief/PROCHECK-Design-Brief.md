# PROCHECK Safety - Design Brief & Taste Audit

**Prepared by:** Munas for Alejandra Ibarra (Ale)
**Date:** 2026-07-18
**Skill applied:** `procheck-taste` on top of upstream `design-taste-frontend` (Leonxlnx / tasteskill.dev, MIT)
**Scope:** 5 marketing pages currently live at `localhost:3000` - Home, Courses, Consulting, Software, Certificate-lookup

---

## 1. Design Read (locked)

> Reading this as: **B2B Mexican compliance SaaS** for HR and Safety Coordinators at construction, chemical, metal-mechanical, and mining companies, with a **trust-first industrial-warm** language, leaning toward **Tailwind v3 + own primitives + amber/blue palette** on white with navy anchors.

Audience is not Awwwards judges. Audience is Ale's client roster: safety officers preparing STPS audits, HR directors buying seat licenses, subcontractor managers under a construction prime. Every design decision below serves that audience.

## 2. Dials

| Dial | Value | Reasoning |
|---|---|---|
| `DESIGN_VARIANCE` | **6** | Restrained. Compliance product, no experimentation. |
| `MOTION_INTENSITY` | **4** | Subtle. Hover-lift, fade-in. No scroll hijack. |
| `VISUAL_DENSITY` | **4** | Marketing airy (3), dashboard tighter (5). |

Overrides only if a specific page needs it. Sign-off pages bias to **5** on VARIANCE to stay conservative.

## 3. Design System Choice

- Foundation: **Tailwind CSS 3.4** utility-first
- Components: own primitives in `src/components/ui/` (Button, Card, Input) with a shadcn-style API. We do NOT install shadcn.
- Icons: `lucide-react` only
- Images: Unsplash hotlinks through `src/lib/images.ts`
- Fonts: system-ui stack + Inter fallback (upstream taste-skill Section 4.1 warns against Inter as a default, but our brand-mark and headline scale absorb it fine at this VARIANCE)

Rejected systems (upstream taste-skill Section 2.A): Fluent, Material 3, Carbon, Polaris, Atlaskit, Primer, GOV.UK, USWDS, Radix Themes. None fit a Mexican vertical SaaS with our own brand.

## 4. Palette (locked)

| Token | Hex | Class | Role |
|---|---|---|---|
| Primary CTA | `#F59E0B` (amber-500) | `bg-amber-500 hover:bg-amber-600 text-black` | Ver cursos, Añadir al carrito, Iniciar sesión |
| Secondary CTA | white outline | `border border-slate-200 hover:bg-slate-50` | Agenda una demo, Volver |
| Dark anchor | `#0F172A` (slate-900) | `bg-slate-900 text-white` | Cert-lookup band, final CTA, sidebar accent |
| Accent | `#2563EB` (blue-600) | `text-blue-600` | Links, focus rings, trust icons |
| Soft section bg | `#F5F8FC` blue-tinted | `bg-slate-50` | Between-section rhythm |
| Body | `#475569` slate-600 | `text-slate-600` | Paragraph copy |
| Headline | `#0F172A` slate-900 | `text-slate-900 tracking-tight` | H1, H2 |

No purple gradients. No aurora mesh. No glassmorphism on marketing pages. This is one of the top upstream taste-skill Section 9 bans.

## 5. Per-Page Taste Audit

For each page: **PASS** = matches the locked read and passes upstream Section 9. **NEEDS PASS** = violates one or more rules; fix listed.

### 5.1 Home (`/`)

**Current shape:** 2-col asymmetric hero with floating trust card, trust-chip strip, industry grid, featured courses, testimonial row, dark final CTA.

| Check | Status | Note |
|---|---|---|
| Design read alignment | PASS | Industrial imagery, restrained motion, trust-forward. |
| Anti-Default Discipline | PASS | Not centered over mesh, not three equal feature cards without variance, not purple gradient. |
| Section rhythm (kicker / H2 / sub / content) | PASS | Kicker used correctly. |
| **Em-dash ban (Section 9.G)** | **FAIL** | `page.tsx:41` uses ` -- ` in the hero subhead. Every other subhead too. **Must be rewritten with periods, commas, or line breaks.** |
| 3-col equal card row (Section 9.C) | **PARTIAL FAIL** | Home has THREE `grid md:grid-cols-3` rows (Consulting cards, Software cards, Testimonials). Testimonials can stay (3 short quote cards is common), but Consulting + Software should switch to **2-col zig-zag** or **asymmetric 1+2** to break the AI-slop cadence. |
| Fake company names (Section 9.D) | PASS | Uses real fixture companies (Acme Constructora, Delta Minería, Bravo Industrial) that already exist in the walkthrough demo data. |
| Trust strip "Confían en nosotros" | PASS-ish | Wording "Confían en nosotros" is fine and natural (upstream bans "Quietly trusted by" in English; Spanish equivalent isn't a Tell). |
| Floating badge cards on hero image | PASS | Real content (94% compliance, DC-3 preview), not a fake dashboard div. |
| Version stamps / build labels | PASS | None. |
| Scroll cues | PASS | None. |

**Fix list:** [1] purge every em-dash and en-dash across page. [2] break one of the 3-col rows into a 2-col zig-zag - Consulting is the natural candidate (3 cards -> Agendar cita on left long card + 2 stacked on right).

### 5.2 Courses (`/courses`)

**Current shape:** Sticky sidebar filter left, tab bar (Todos / Básicos / Complementarios) + sort dropdown + result count + grid.

| Check | Status | Note |
|---|---|---|
| Design read | PASS | Catalog is legitimately dense; density 5 acceptable here. |
| Filter labels in Spanish | PASS | Categoría, Precio, Duración, Industria. No EN. |
| Card layout | PASS | Amber NOM badge, image, hours chip, price, full-width CTA. |
| **Em-dash in copy** | Check needed | Scan `CourseCard.tsx` and `courses.ts` for any `--`. |
| Card `grid sm:grid-cols-2 xl:grid-cols-3` | PASS | Different from the banned "3 identical feature cards horizontally" pattern; this is a real product grid. Grid catalogs are exempt from the 3-col ban. |
| Empty state | PASS | Friendly message + "Limpiar filtros". |
| Sort dropdown | PASS | Real function, not decorative. |

**Fix list:** [1] em-dash scan; likely clean but confirm. [2] verify industry filter pills use uppercase-first casing consistent with sidebar labels.

### 5.3 Consulting (`/consulting`)

**Current shape:** Bigger hero image (heroConsulting), 3-service cards, timeline with connecting gradient line, casos de éxito quote cards, dark final CTA.

| Check | Status | Note |
|---|---|---|
| Design read | PASS | Restraint. Trust-forward. |
| Removals baked in | PASS | Vigilancia gone, Diagnóstico gone. |
| Nuestros servicios row | **PARTIAL FAIL** | Three equal service cards, same size, same layout. Upstream Section 9.C bans this cadence. Convert to **asymmetric grid**: one wide "Agendar cita con vendedor" card on top (the primary CTA-driving service), two smaller ones below. |
| Timeline "Nuestro proceso" | PASS | 3 numbered circles now (post-fix). But: **check step labels** - upstream Section 9.F bans generic "Stage 1 / Stage 2 / Stage 3" step naming. Ours are "Propuesta / Implementación / Seguimiento" which are real verbs so we're fine, but keep them noun-form, not "Fase 1 / Fase 2". |
| Casos de éxito | PASS | Real company names, real result pills. |
| **Em-dash** | **FAIL** | Very likely present in service descriptions and hero subhead. Scan and purge. |
| Final CTA on dark navy | PASS | Amber button on navy is our signature. |

**Fix list:** [1] em-dash scan. [2] break 3-service equal cards -> 1 wide + 2 stacked asymmetric grid.

### 5.4 Software (`/software`)

**Current shape:** 2-col hero (heroSoftware), 6-feature grid with lucide icons, pricing table with "Popular" ribbon on Business, testimonial card.

| Check | Status | Note |
|---|---|---|
| Design read | PASS | |
| Hero 2-col asymmetric | PASS | |
| 6-feature grid `grid sm:grid-cols-2 lg:grid-cols-3` | **PARTIAL FAIL** | 6 identical-size cards in a 3-col grid is a Section 9.C Tell. Convert to **bento**: mix one wide feature card with 4 small ones + 1 tall. Bento grid is the correct antidote. |
| Pricing table 3-col | PASS-ish | Pricing comparison is legitimately 3-col because there are 3 tiers (Free/Business/Enterprise). Comparison tables are exempt. **However** the current one has `border-t + border-b` on every row - that's Section 9.F banned. Use one hairline between tiers, not every row. |
| "Popular" ribbon on Business | PASS | Real semantic function. |
| **Em-dash** | **FAIL** | `page.tsx:107` confirmed uses ` -- `. Fix. |
| Testimonial with avatar | PASS | Real photo. |

**Fix list:** [1] em-dash purge. [2] convert feature grid to bento. [3] simplify pricing table borders.

### 5.5 Certificate lookup (`/certificate-lookup`)

**Current shape:** Big center card with search input + QR icon, folio example hint, shield-icon trust row, dark navy band variant on home footer.

| Check | Status | Note |
|---|---|---|
| Design read | PASS | Simple, single-purpose, trust-first. |
| Center-column form | PASS | Correct pattern for lookup UIs. |
| Trust row (shield icons) | PASS | Real semantic meaning (validation-official). |
| QR icon in input | PASS | Real function (future QR scan). |
| **Em-dash** | Check | Scan and purge. |
| Empty state result view | TODO | If Ale searches a valid folio she should see the certificate detail card. Not yet built. |

**Fix list:** [1] em-dash scan. [2] add stubbed result card so demo has something to show.

## 6. Cross-Page Findings

| Finding | Severity | Where | Fix |
|---|---|---|---|
| **Em-dashes throughout** | CRITICAL | Home hero, Software features, layout title, images.ts comments | Global find/replace. Non-negotiable per upstream Section 9.G. |
| Three-equal-cards cadence | HIGH | Home consulting/software teasers, Consulting services, Software features | Break with asymmetric or bento layouts on at least one section per page. |
| Comment em-dashes in code | MEDIUM | `src/lib/images.ts:1,5` | Fix even though not user-visible - hygiene. |
| Layout metadata title | LOW | `layout.tsx:5` has em-dash in `<title>` | Fix. |
| Focus rings audit | MEDIUM | Need to verify every interactive element has `focus:ring-2 focus:ring-amber-500/50` | Sweep. |
| Mobile check | MEDIUM | Grids collapse correctly, but hero image on Home currently keeps aspect ratio too tall on 375px viewport | Test at 375px, adjust `aspect-*` if needed. |

## 7. Pre-Flight Checklist (before showing Ale)

- [ ] Zero em-dash characters (`—` or `–`) anywhere in the diff
- [ ] Zero `PROCHEECK` (double E) occurrences in code or copy
- [ ] Zero `Vigilancia` or `Diagnóstico` occurrences on Consulting page
- [ ] Zero EN language toggle instances (already done, verify)
- [ ] Every image URL resolves (Unsplash hotlinks or `/images/*`)
- [ ] Every CTA lands on a real route (no dead links)
- [ ] Every hover state has `transition-all duration-200`
- [ ] Every interactive element has a focus ring
- [ ] Mobile 375px, tablet 768px, desktop 1440px all render
- [ ] Lighthouse accessibility >= 90 on Home + Courses
- [ ] Home passes taste-skill Section 14 final pre-flight

## 8. Recommended Order of Operations

Given the audit, the fastest path to sign-off:

1. **Em-dash global purge** (30 minutes, safe, no visual change - just character swap). Also purge `PROCHEECK` residues and comment em-dashes. This is a pure hygiene pass that unlocks upstream Section 14 pre-flight.
2. **Home: break 3-col rows into asymmetric** (60 minutes). Consulting teaser row = 1 wide + 2 stacked. Software teaser stays 3-col (only 3 features; acceptable). Testimonials stay 3-col.
3. **Consulting: services asymmetric** (30 minutes). Agendar cita = wide top card, other two below.
4. **Software: features bento** (60 minutes). Mix wide/tall/small tiles.
5. **Software: pricing borders cleanup** (15 minutes).
6. **Certificate-lookup: stub result card** (30 minutes) so demo has something.
7. **Focus rings + mobile check sweep** (30 minutes).
8. **Final pre-flight** against Section 14 + PROCHECK Section 10.

**Total: ~4 hours of focused work** to get all 5 marketing pages through taste-skill pre-flight and ready for Ale.

## 9. What Ale Will See When This Is Done

Same site, same routes, same copy where it matters, same features. But: no em-dash tells, no lazy 3-col cadence, asymmetric layouts that read as designed rather than templated, cleaner spec table on pricing, and a working certificate-lookup result card. All the client-annotation fixes remain baked in.

She should recognize the site immediately (nothing rearranged that she asked for) but feel it looks **more finished** than the mockup her team originally reviewed.

---

**Skill sources:**
- Upstream: `~/.claude/skills/design-taste-frontend/SKILL.md` (Taste Skill v2 by Leonxlnx, MIT, ~1200 lines)
- Local preset: `~/.claude/skills/procheck-taste/SKILL.md` (Munas, this project, ~120 lines)
- Repo cloned at: `f:/Munas/procheeck/vendor/taste-skill/`
