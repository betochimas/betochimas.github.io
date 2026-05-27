# Home Page UI Overhaul — Implementation Plan

**Status:** Draft for review
**Date:** 2026-05-26
**Scope:** Visual redesign of the home page (hero, nav, work section, interests,
footer) to match the Figma mockup. Frontend-only — no API contract changes, so
no `conflicts-integration.md` coordination required. **All rewritten and new
components/data files are authored in TypeScript (`.tsx` / `.ts`)** — see §1.1.

---

## 1. Goals

Translate the approved Figma mockup into the live React + Tailwind app. The
mockup establishes:

- A left-aligned hero with a large name, constrained bio, portrait photo, and two
  differentiated CTA buttons (filled primary + outlined secondary).
- A clean text-link navbar with an active state and an icon-only theme toggle.
- A "Selected Work" section using **alternating text/image rows** (replacing the
  current 3-up card grid).
- A new **Interests** section.
- A real footer with a site-name/social block and link columns.
- A single indigo accent color applied consistently (buttons, links, active nav).

### 1.1 Language: TypeScript-first

Every file touched by this redesign is migrated to / created in TypeScript.
This is incremental, not a big-bang conversion — the toolchain already supports
it:

- `tsconfig.json` already has `strict: true`, `jsx: "react"`, and `allowJs: true`,
  so new `.tsx`/`.ts` files are strict-checked while remaining `.jsx` files keep
  working untouched. We only convert the files this plan already rewrites.
- **Renames are mostly transparent.** Importers use extensionless paths (e.g.
  `App.jsx` does `import Home from './pages/Home'`), so `Home.jsx → Home.tsx`
  needs no import edits. **Exception:** `main.tsx` imports `./App.jsx` with an
  explicit extension — if we rename `App.jsx → App.tsx`, that one import must be
  updated.
- **Do NOT `import React`** in components. Step 0 aligned `tsconfig` to `jsx:
  "react-jsx"` (automatic runtime), matching the ESLint `react/jsx-runtime` config
  and Vite's React plugin — so a bare `import React` is now flagged as unused.
- **Typing standard:** every component gets an explicit props `interface`/`type`;
  no implicit `any`. Shared data shapes (`Project`, `Interest`, `NavItem`,
  `ButtonProps`) get exported types co-located with their data file or in
  `src/types/`.
- **Tooling gaps to close (Step 0):** extend the lint script to `--ext
  js,jsx,ts,tsx` (ensuring the ESLint config is TS-aware), and add a `typecheck`
  script (`tsc --noEmit`) so `.tsx` files are actually verified in CI/local.

Files converted by this plan: `Navigation`, `Intro`, `Footer`, `ThemeButton`,
`Home`, `portfolio` data, plus the `react.svg`/`constants`/`social_icons` helpers
they pull in (as needed); new files `Button`, `WorkRow`, `Interests`, `interests`
data are authored as `.tsx`/`.ts` from the start. `App.jsx → App.tsx` is optional
but recommended for consistency (remember the `main.tsx` import edit).

---

## 2. Current State → Target (file map)

| Area | Current file(s) | Current state | Target |
|------|----------------|---------------|--------|
| Routing | `src/App.jsx` | Routes: `/`, `/poliviz`, `/conflicts`, `/page2`, `/page3`, `*` | Likely unchanged; nav label decisions may add routes |
| Nav | `src/components/Navigation.jsx` | Bordered pill links, awkward `relative top-5 right-1/4` positioning, theme button injected inside | Name left, text links center w/ active state, theme icon right |
| Hero | `src/components/Intro.jsx` | Centered, empty `<h1>`, name in `<p>`, long centered bio, inline cyan "My experience" link, **no photo, no buttons** | Left-aligned, large name, constrained bio, portrait image, 2 CTA buttons |
| Work | `src/components/Portfolio.jsx`, `PortfolioItem.jsx`, `src/data/portfolio.js` | 3-up bordered card grid; data has `title/imgUrl/stack/link` | Alternating row layout; data needs `description` + `buttonLabel` |
| Interests | — (does not exist) | — | New section + new data file |
| Footer | `src/components/Footer.jsx` | Single centered copyright line | `Footer.tsx`: keep copyright only (A5), restyled with tokens |
| Theme | `src/components/ThemeButton.jsx` | Fixed-position violet/orange button, follows system, **no persistence** | `ThemeButton.tsx`: inline nav icon, matches social-icon weight, persists to `localStorage` |
| Tokens | `tailwind.config.cjs` | Election-viz colors only, no accent | Add semantic accent + surface colors |
| Sections in use | `src/pages/Home.jsx` | Renders `Intro / Portfolio / Timeline / Contact / Footer` | `Home.tsx`: `Intro / SelectedWork / Interests / Footer` — `Timeline` + `Contact` removed (A6) |

> All "Target" components/data files are authored in TypeScript — see §1.1.

---

## 3. Work Breakdown (discrete, orderable steps)

### Step 0 — Foundation: design tokens + TS tooling *(do first; everything depends on it)*
- In `tailwind.config.cjs` `theme.extend.colors`, add a semantic palette so the
  accent isn't hardcoded everywhere:
  - `accent` (indigo, ~`#5B4FCF`) + a darker `accent-hover`
  - `surface` (warm off-white `#F7F7F5`) and `surface-dark` (`#0E0E0E`)
  - `ink` (near-black `#111111`) and `ink-dark` (`#F0F0EE`)
  - `muted` (`#E4E4E7`) for borders/dividers/tag backgrounds
- Convert `Home.jsx → Home.tsx`; replace the existing `bg-white` / `text-stone-900`
  / `dark:bg-stone-900` usages with the new surface/ink tokens. (Extensionless
  importers need no edits.)
- **TS tooling:** update the `lint` script to `--ext js,jsx,ts,tsx` and confirm
  ESLint is TS-aware (add `@typescript-eslint` parser/plugin if missing); add a
  `typecheck` script (`tsc --noEmit`) to `package.json`.
- **Done when:** tokens exist, Home renders identically except base colors,
  `npm run typecheck` passes, lint covers `.tsx`.

### Step 1 — Navigation → `Navigation.tsx`
- Rewrite as `Navigation.tsx`: name/initials on far left (links to `/`), text
  links centered, social + theme icons on the right.
- Strip the pill borders; links are plain text, muted by default, accent on
  hover/active. Use `react-router-dom`'s `NavLink` for automatic active styling.
- **Nav items (per A1):** real `NavLink`s for **Home, Poli Viz, Conflicts** only.
  Render **Blog, Satori, MLOps?** as non-clickable `<span>`s in a more muted color
  (placeholders, no routes) so they appear in the bar without linking anywhere.
- Type a `NavItem` shape (e.g. `{ label: string; to?: string }`; absence of `to`
  ⇒ rendered as a muted span).
- Pull `ThemeButton` out of the nav's internals and render it as a sibling icon
  matching the GitHub/mail icon weight.
- **Done when:** nav matches mockup, active page highlights, placeholders are
  visibly muted/non-clickable, theme icon aligned.

### Step 2 — Hero (Intro) → `Intro.tsx` + `Button.tsx`
- Rewrite `Intro.tsx` as a two-column flex: left = name (`<h1>`, large) + bio
  (left-aligned, `max-w-prose`) + two buttons; right = portrait image in a 4:5
  frame (`aspect-[4/5] object-cover`).
- Create a reusable typed `Button.tsx` (`src/components/templates/`) with a
  `variant: 'primary' | 'secondary'` prop (filled accent vs. outlined) — reused
  by Interests too.
- **CTAs (per A7):** primary = GitHub, secondary = "Get in Touch" (mailto).
  **No résumé download button.**
- Tighten hero→CTA vertical spacing (the mockup had too large a gap).
- **Asset needed:** headshot at 4:5 (placeholder until provided).
- **Done when:** hero is left-aligned, photo framed, two buttons differentiated.

### Step 3 — Selected Work (Portfolio refactor) → `WorkRow.tsx` + `portfolio.ts`
- Convert `portfolio.js → portfolio.ts` with an exported `Project` interface;
  add `description` (1–2 sentences) and `buttonLabel`, confirm `link` per project.
- **Curate to the top 3 projects (per A2)** — drop the 4th from what renders.
- Replace the `PortfolioItem` card with a typed `WorkRow.tsx`: text column
  (heading, description, button) + image column (16:9, `aspect-video
  object-cover`). Retire `Portfolio.jsx`/`PortfolioItem.jsx`.
- **All images on the right (per A3)** — no alternating sides for now.
- Section heading: "Selected Work".
- **Done when:** 3 rows render from typed data, responsive stack on mobile.

### Step 4 — Interests (new) → `Interests.tsx` + `interests.ts`
- Create `src/data/interests.ts` (typed `Interest[]`, shape `{ label: string;
  body: string }`) and an `Interests.tsx` component: heading + list on the left,
  image on the right (3:2), two buttons at the bottom (reusing `Button`).
- **Stays on the home page (per A4).**
- **Content + asset needed:** interest copy + one 3:2 image.
- **Done when:** section renders and matches mockup.

### Step 5 — Footer → `Footer.tsx`
- **Per A5: keep it minimal — just the existing copyright line.** No link columns,
  no social block (overrides the mockup's elaborate footer). Convert
  `Footer.jsx → Footer.tsx` and restyle with the new surface/ink tokens.
- **Done when:** footer shows the copyright line, themed, typed.

### Step 6 — Theme toggle polish → `ThemeButton.tsx`
- Convert `ThemeButton.jsx → ThemeButton.tsx`; persist choice in `localStorage`
  and read it on load (fall back to `prefers-color-scheme`). Remove fixed
  positioning + colored background; it now lives inline in the nav.
- **Done when:** theme persists across reloads, icon styled as a plain nav icon.

### Step 7 — Cleanup & verification
- Remove `Timeline` and `Contact` from `Home.tsx` and delete the now-unused
  components/data (`Timeline.jsx`, `TimelineItem.jsx`, `Contact.jsx`,
  `data/timeline.js`) **(per A6)**; remove dead commented code in `Intro`/`Navigation`.
- Optionally convert `App.jsx → App.tsx` (update the `./App.jsx` import in
  `main.tsx`).
- Run `npm run typecheck`, `npm run lint`, `npm run build`; preview on the
  `*.pages.dev` URL.
- Verify dark mode across all sections; verify mobile responsive stacking.

---

## 4. New / Changed Assets

| Asset | Spec | Status |
|-------|------|--------|
| Headshot | 4:5 portrait | needed (placeholder for now) |
| Project images ×3 | 16:9 | needed (replace `react.svg` placeholders) |
| Interests image | 3:2 | needed |

*(Image ratio enforcement via Tailwind `aspect-*` + `object-cover` was agreed;
exact pixel sizes deferred.)*

---

## 5. Suggested Sequencing

`Step 0 → Step 1 → Step 2 → Step 3 → Step 4 → Step 5 → Step 6 → Step 7`

Step 0 must come first (tokens). Steps 1–6 are otherwise independent and could be
parallelized across sessions once the `Button` component (Step 2) exists, since
Steps 2 and 4 both depend on it. Each step is small enough to be one commit /
one delegated task.

---

## 6. Resolved Decisions

*All open questions answered (A1–A7 below) and folded into the steps above.*

- **Q1 — Nav items.** Mockup shows `Home · Blog · Poli Viz · Conflicts · Satorl ·
  MLOps?`. Current routes only cover Home / Poli Viz / Conflicts. Do Blog, Satorl,
  and MLOps get real routes now, placeholder "coming soon" pages, or get dropped
  until their content exists?
  - ***A1 -*** Can you make these not real routes and non-clickable with perhaps a more muted color? If not, then don't add then in yet.
- **Q2 — Project count.** Mockup shows 3 work rows; `portfolio.js` has 4 (ASR,
  Website, Toy LLM, Conflicts API). Show all 4, or curate to a top 3?
  - ***A2 -*** Curate to a top 3.
- **Q3 — Alternating sides.** Strictly match mockup (all images right) or alternate
  image side row-to-row for more visual rhythm?
  - ***A3 -*** All images right, for now.
- **Q4 — Interests content.** Need the 3 interest labels + body copy, plus one
  image. Or should Interests move to a separate About page instead of the home
  page (raised earlier)?
  - ***A4 -*** Interests will stay on the home page, for now.
- **Q5 — Footer columns.** What goes in the footer link columns? (e.g. duplicate
  nav, social/contact, external profiles.)
  - ***A5 -*** Just the existing copyright info.
- **Q6 — Timeline & Contact.** Home currently also renders `Timeline` and a
  `Contact` form (getform.io placeholder, not wired up). The mockup omits both.
  Remove them, or relocate to other pages?
  - ***A6 -*** Remove both.
- **Q7 — Primary CTA target.** GitHub for primary, and "Get in Touch" (mailto) vs.
  résumé download for secondary? 
  - ***A7 -*** GitHub for primary. The "Get in Touch" (mailto) is secondary, and there shouldn't be a resume download button.


---

## 7. Out of Scope (deferred)

- Exact image pixel dimensions / sourcing final photos.
- Content rewrite of the bio (you plan to overhaul that copy separately).
- The Cloudflare Pages / Cloud Run / Neon migration (tracked separately).
- Any changes to the Poli Viz or Conflicts pages.
