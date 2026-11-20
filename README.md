# Innspireo Careers — Frontend

A Next.js rebuild of the `jobs.innspireo.com` candidate-facing job portal.

Written for: the SMEClabs engineering team maintaining this project.

---

## Quick start

```bash
npm install
npm run dev     # http://localhost:3000
```

No environment variables are required. Job data loads from the live public API,
and the screens that need backend endpoints that do not exist yet show an
explicit "not connected" state rather than pretending to work.

The font is self-hosted, so builds do not reach out to Google Fonts and work
offline.

```bash
npm run build   # production build (prerenders every job page)
npm start       # serve the build
npx tsc --noEmit && npx eslint src --max-warnings 0   # gates used during development
```

---

## Stack

| Concern | Choice |
|---|---|
| Framework | Next.js 15.5 (App Router), React 19 |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 (CSS-first `@theme` tokens) |
| Icons | lucide-react |
| Fonts | DM Sans, self-hosted (`src/app/fonts/`, SIL OFL) via `next/font/local` |
| Data | Server Components fetching the live Laravel API, ISR at 300s |

Deliberately **no** component library, CSS-in-JS, state manager or data-fetching
library. The design system in `src/app/globals.css` plus a handful of primitives
in `src/components/ui/` cover everything the site needs.

---

## Architecture

### Why the full job catalogue is fetched and filtered in memory

Probing production established that `/api/jobs` honours exactly **one** query
parameter — `keyword`. `category`, `job_type`, `experience`, `work_mode`,
`country`, `sort` and `per_page` are all accepted and silently ignored
(`total` stays at 26), and `per_page` is pinned to 15.

So `src/lib/api.ts` pulls the whole catalogue once per revalidation window,
caches it, and does filtering, sorting and facet counting server-side. At this
catalogue size that is strictly better: exact facet counts, multi-field
filtering the API cannot express, and one upstream request per 5 minutes rather
than one per interaction.

**When the backend gains real query support**, replace the in-memory pipeline
inside `getJobs()` with a single parameterised fetch. Nothing outside
`src/lib/api.ts` needs to change.

### Data normalisation

The live database has quality problems that this frontend repairs at the display
layer (see `src/lib/format.ts`):

- `countries.name` contains **"Baharin"** and **"Netharlands"** — resolved via an
  alias table in `src/lib/constants.ts` so no typo ever reaches the UI.
- `jobs.location` is unnormalised free text — `kuwait`, `KUWAIT`, `OMAN`,
  `MUSCUT` — title-cased and matched to a canonical destination.
- There is **no `salary_period` column**, yet the data mixes monthly Gulf figures
  (1800 KWD) with annual Indian ones (638000 INR). `inferSalaryPeriod()` derives
  the period from currency and magnitude instead of mislabelling everything
  "annual" the way the old site's filter did.

These are display-layer workarounds. The real fixes are backend data migrations;
each workaround is commented with that note.

### Page structure (client-specified)

| Page | Sections, in order |
|---|---|
| `/` | hero, counting, about, what we offer, find right staff, faq |
| `/about` | about, service listing, mission, vision, our team |
| `/services` | service cards, Partner with Innspireo, why choose us |
| `/contact` | contact form + channels |
| `/jobs`, `/jobs/[slug]` | the job board |

These lists came from the client directly. Sections were removed to match them
(the old "How placement works" and dual closing CTA on the home page), so add
to them only on request.

`TEAM`, `PARTNERSHIP` and `WHY_CHOOSE` in `content.ts` hold the client's own
wording — in particular Biju Mohamed's title and bio are as supplied. Do not
embellish those credentials.

### Team portraits

The About page's team card has a 4:5 portrait slot driven by `TEAM[].photo` in
`content.ts`. It currently points at `/images/team/placeholder.png` — a branded
navy graphic with a neutral silhouette, **not** a photograph of the person.

That is deliberate: inventing a likeness for a named real individual on a live
business site is not something to ship. To use the real headshot, drop the file
in `public/images/team/` and change the one `photo:` line. A 4:5 portrait crop
at roughly 800x1000 or larger will look right; `next/image` handles the rest.

### Hosting split: corporate domain + jobs subdomain

The plan is corporate pages on the apex domain and the job board on
`jobs.innspireo.com`. The app is already wired for it without a fork:

- `jobsUrl(path)` in `constants.ts` returns a same-origin path by default and
  an absolute URL once `NEXT_PUBLIC_JOBS_BASE_URL` is set. Every job-board link
  in the header, footer, hero and corporate pages goes through it.
- `SITE.url` (canonicals, OpenGraph, sitemap, JSON-LD) reads
  `NEXT_PUBLIC_SITE_URL`, so the corporate deployment stops claiming the
  subdomain as its canonical host.

To split, deploy this one app twice with different env — the exact values are
in `.env.example`. Verified: with `NEXT_PUBLIC_JOBS_BASE_URL` set, home-page
job links render as `https://jobs.innspireo.com/jobs?...`; with it unset they
stay `/jobs?...`.

### Every deadline in the database is in the past

All 26 listings carry a `deadline` that has already elapsed, while every one of
them is still `status: "active"` and the Laravel site still accepts
applications on them. The column is simply not maintained.

So **open/closed is driven by `status`, never by `deadline`** (`isClosed()` in
`format.ts`). Driving it off the date marked the entire catalogue "Closed" and
rendered every card at `opacity-70`, which is what made the site look greyed
out. `deadlineLabel()` prints "Open until filled" rather than a stale date that
contradicts an open vacancy, and the "closing soon" badge only appears for a
deadline genuinely still ahead.

**Ask the client to keep deadlines current, or drop the column.** If they start
maintaining it, closed listings will want `status` updated too.

### Home page is the corporate site, not the job board

`/` carries hero, stats, about, services, the recruitment pitch, process, FAQ
and a split CTA. Individual vacancies appear **only** under `/jobs` — no job
cards or job links on the home page, which is asserted in the smoke test. This
mirrors the intended split where the corporate site is the main domain and the
job board is its own section.

### Package facts parsed out of the description

Only 3 of 26 listings populate `responsibilities` and 4 populate `benefits`, so
most job pages would otherwise be a title and a single paragraph. But 8 of them
embed the package inside the free-text `description` as emoji-prefixed
`Label: Value` lines:

```
Salary: 150 KD
Accommodation: Provided
Working Hours: 9 hours including break
```

`extractPackageFacts()` lifts those into the "Package at a glance" grid on the
detail page, and `stripPackageFacts()` removes them from the prose so they are
not shown twice. The parser is deliberately conservative — a label of at most
three words, a short non-empty value, no sentence-ending punctuation, and at
least two matches before it treats the block as real — so a description that
merely contains a colon does not sprout a bogus grid.

Jobs without that pattern simply do not render the section. The at-a-glance
strip under the job title (deadline, experience, work mode, education) is
separate and always present, because the apply card beside it is tall enough
that the header band reads as empty without it.

---

## What this frontend needs from the backend

Everything below is currently **absent** from the Laravel app. Each has a
single, documented integration point on the frontend side.

The client for all of it is **already written**. `src/lib/auth.ts` and
`src/lib/candidate.ts` call these endpoints, and every candidate screen renders
against the shapes they return. Nothing is mocked and no placeholder data
ships: until `NEXT_PUBLIC_API_AUTH_ENABLED` is `"true"`, each screen shows an
explicit "not connected" state instead.

| Capability | Needed endpoint(s) | Frontend client |
|---|---|---|
| CSRF priming | `GET /api/csrf-cookie` (or `/sanctum/csrf-cookie`) setting a JS-readable `XSRF-TOKEN` | `primeCsrf()` in `src/lib/api-client.ts` |
| Candidate auth | `POST /api/login`, `/api/register`, `/api/logout`, `GET /api/user` (401 when signed out) | `src/lib/auth.ts` |
| Email verification | `POST /api/email/verify`, `/api/email/resend` | `/verify-email` page |
| Passwords | `POST /api/forgot-password`, `/api/reset-password` | `/forgot-password`, `/reset-password` |
| Candidate profile | `GET`/`PATCH /api/candidate/profile` | `src/lib/candidate.ts` |
| CV upload | `POST`/`DELETE /api/candidate/cv` (multipart, field `cv`) | profile form |
| Apply to a job | `POST /api/applications` | `ApplyButton` on job detail |
| Application tracking | `GET /api/candidate/applications`, `DELETE .../{id}` to withdraw | `/applications` |
| Saved jobs | `GET`/`POST`/`DELETE /api/candidate/saved-jobs` | `SaveJobButton`, `/saved-jobs` |
| Job alerts | `POST /api/alerts` | footer + empty-state CTAs |
| Enquiry intake | any JSON POST endpoint | `ENQUIRY_WEBHOOK_URL`, see `src/app/api/enquiry/route.ts` |
| Blog content | `GET /api/blogs` | `src/lib/content.ts` → `BLOG_POSTS` (links out to the old site until then) |

Validation errors are expected in Laravel's shape — HTTP 422 with
`{ "message": ..., "errors": { "field": ["..."] } }` — because the forms render
them inline per field.

`/sanctum/csrf-cookie` already responds `204`, so Sanctum is installed — the SPA
cookie flow is written against it and should work once CORS
(`supports_credentials: true`, this origin allowed, `SANCTUM_STATEFUL_DOMAINS`)
and the JSON routes are added.

**Two notes for whoever builds it.** The session cookie must be `SameSite=Lax`
on a domain shared by the site and the API — mixing `localhost` and
`127.0.0.1` counts as cross-site and the browser silently drops it. And if the
framework rotates its CSRF token on sign-in, the JS-readable cookie has to be
re-stamped on every response, or every request after login fails with 403.

### Security note

`GET /api/jobs` is public, unauthenticated, and returns raw Eloquent models —
including `company.email`, `company.phone`, `company.user_id` and `deleted_at`
soft-delete columns. It should be wrapped in an API Resource that exposes only
the fields the frontend consumes. This frontend does not render any of the
leaked fields, but the endpoint is reachable directly.

---

## Project layout

```
src/
  app/
    layout.tsx              root shell, fonts, Organization JSON-LD, theme script
    globals.css             the design system (tokens, utilities; single theme)
    page.tsx                home
    jobs/                   listing (filters, sort, pagination) + [slug] detail
    services/               the nine service lines (corporate content)
    hire-with-us/           employer lead capture
    about|faqs|blogs|contact|privacy|terms/
    login|register|forgot-password|verify-email|reset-password/
    dashboard|profile|applications|saved-jobs/   candidate area (live API)
    api/enquiry/route.ts    form intake with webhook forwarding
    sitemap.ts, robots.ts, not-found.tsx
  components/
    layout/                 header (auth-aware), footer, logo, shells
    auth/                   auth provider, verify-email, reset-password
    candidate/              profile form, applications, saved jobs, gate
    ui/                     button, primitives, field, accordion
    jobs/                   job card, filters, pagination, employer profile
    home/                   hero, sections
    forms/                  auth forms, enquiry form
  lib/
    api.ts                  job data + filtering/faceting (server-side)
    api-client.ts           browser client: CSRF, credentials, typed errors
    auth.ts                 session auth (feature-flagged, off by default)
    candidate.ts            profile, CV, applications, saved jobs
    types.ts                mirrors the live API payload
    format.ts               normalisation (location, salary, dates, prose)
    constants.ts            site config + taxonomies + country aliases
    content.ts              FAQs + blog references
    employers.ts            employer profiles + what the job text reveals
    utils.ts                cn()
```

---

## Design system

**White and navy blue, set in DM Sans, with square corners throughout.**

| Role | Token | Value |
|---|---|---|
| Headlines, navy panels, primary buttons | `brand-900` | `#0F1C33` |
| Links and accents | `brand-600` | `#2A4A80` |
| Page background | `--page` | `#FFFFFF` |
| Alternating band / inputs | `surface-muted` | `#F6F8FB` |
| Body text | `content-muted` | `#4E5868` |

There is no third accent colour. Amber is reserved strictly for warning notices
and rose strictly for errors, so neither competes with the navy.

**Geometry is square.** Every radius alias — `--radius-field`, `--radius-card`,
`--radius-panel`, `--radius-pill` — resolves to `0px`, so even a stray
`rounded-card` or `rounded-pill` cannot reintroduce rounding. All 103 radius
class usages in the source are `rounded-none`, and the compiled bundle contains
no non-zero `border-radius`. Structure comes from rules, spacing and surface
changes instead.

The page is white, so a `Section` marked `muted` renders a light grey band —
that alternation is what creates the vertical rhythm.

`bg-navy-panel` is the deep navy contrast block used for the hero's right-hand
panel, the employer CTA and the auth screen.

**Contrast is verified, not assumed.** Every foreground/background pair passes
WCAG AA. Body text runs 4.8:1 to 17.0:1. Note that `content-subtle` is `#656E7F`
rather than a lighter grey specifically because the lighter value measured
4.31:1 against the muted band and failed; do not lighten it without re-checking
that pair.

**Single theme — there is no dark mode.** No `dark:` variant is registered, so
writing `dark:*` in a component silently does nothing. There is no theme
toggle, no `data-theme` attribute and no `prefers-color-scheme` block.

Tokens are defined once in `globals.css` under `@theme`; semantic surface
colours (`surface`, `content`, `line`) are exposed as Tailwind utilities via
`@theme inline`.

### Page width

`container-page` is `max-width: 108rem` with `padding-inline` of 1.25rem / 2rem
/ 3rem across the breakpoints — wide, but with enough gutter that content is not
flush to the viewport edge.

### Corporate content: /services and /about

Both pages are built from the live corporate site at innspireo.com, held as
structured data in `src/lib/content.ts` (`SERVICES`, `COMPANY`). The nine
service lines, the mission and the vision are the company's own wording,
condensed — nothing on those pages is invented.

Two things worth knowing about the source:

- The corporate site's own navigation links to `/about-us`, `/our-services`
  and `/pricing`, and **all three return 404**. The pages that actually exist
  are `/about-innspireo-hospitality-industry/` and
  `/innspire-hospitality-services/`. That is a live bug on their site, not a
  transcription error here.
- Content is copied, not fetched. If the corporate site is re-worded, update
  `content.ts`.

### Destinations were removed

There is no longer a `/destinations` route, nav entry, homepage section or
footer column. Country data itself is **not** gone: `DESTINATIONS` in
`constants.ts` still drives the location-typo normalisation ("Baharin",
"Netharlands") and the `?country=` filter on `/jobs`, and every link that used
to point at a destination page now points at that filter instead. So nothing
about country handling or filtering changed — only the browse pages went.

### Hero background image

`public/images/hero-hospitality.jpg` (1600×1195) is the background of the
**entire** hero section, not just one panel: it is an `absolute inset-0 -z-10`
layer directly inside `<section>`, so the headline, the glass destination panel
and the white search rail all sit on top of it.

It also runs behind the header. The hero carries
`-mt-[4.75rem] pt-[4.75rem] sm:-mt-20 sm:pt-20` — the negative margin is exactly
the header's height (`pt-3` + `h-16`, and `pt-4` + `h-16` from `sm` up) — which
pulls it up under the sticky bar, and the matching padding puts the content back
below it. `Header` reads `pathname === "/" && !scrolled` into an `overlay` flag:
while that holds, the bar is transparent with white nav text and an inverted
logo; on scroll, or on any other route, it returns to the solid white bar. If
the header's height ever changes, the hero's offset must change with it.

Over the header strip the worst-case composite is `rgb(77, 87, 104)`, where the
white logo measures 7.3:1 and `white/85` nav links 5.8:1.

The scrim opacity was solved, not guessed. The photograph is high dynamic range
(p99 luminance 0.84, blown highlights at 1.0), so `brand-900/78` was chosen by
compositing against its brightest possible pixel:

| Text | Ratio over a blown highlight | Needs |
|---|---|---|
| `text-white` | 8.4:1 | 4.5 |
| `text-white/80` (body copy) | 6.1:1 | 4.5 |
| `text-brand-200` (the accent word) | 5.4:1 | 4.5 |

`0.74` is the floor at which `white/80` still clears 4.5 — **do not lower the
scrim below `/78` without re-running that calculation.** Inside the glass panel
(`bg-white/8`) `white/70` measures only 4.3:1 and fails, which is why nothing in
that panel drops below `white/85`.

`bg-brand-900` sits under the image, so a failed image load degrades to the flat
navy design rather than unreadable text.

---

## SEO

- `JobPosting` JSON-LD on every job detail page (Google Jobs eligibility) with
  `employmentAgency` set, since Innspireo recruits on behalf of clients.
- `FAQPage` JSON-LD on `/faqs`, `Organization` on every page.
- Generated `sitemap.xml` carrying the real `updated_at` per job, and
  `robots.txt` excluding the candidate area and API routes.
- Per-page canonical URLs, OpenGraph and Twitter metadata.
- Expired listings are marked `noindex` while staying reachable.
- Pagination uses real crawlable links with `rel="prev"`/`rel="next"`.

---

## Employer profiles on job pages

`src/lib/employers.ts` + `src/components/jobs/employer-profile.tsx`.

**There is no employer data in the API.** Every vacancy carries
`company_id: 1`, and that record is *Innspireo itself* — described as "one of
the leading global hotel brands", which it is not; it is a recruitment LLP.
Rendering `job.company` as "the employer" would put a false claim on all 27
listings, so `resolveEmployer()` explicitly refuses to treat the agency's own
record as a hiring employer.

What the job text *does* say is the employer's **type**: "a reputed Four-Star
Hotel in Oman". `inferEmployerFacts()` reads that out — property type, star
rating, market, department, and what the package covers — and the page shows
those instead of a placeholder. It is conservative: anything unclear is left
out rather than guessed, so only 2 of the 15 jobs on page 1 state a property
type and the rest show market and department only.

### Naming an employer

Two steps, no backend required:

```ts
// src/lib/employers.ts
export const EMPLOYERS = {
  "grand-bellevue-doha": {
    key: "grand-bellevue-doha",
    name: "Grand Bellevue Doha",
    tagline: "Five-star city hotel · Doha, Qatar",
    propertyType: "Five-star city hotel",
    scale: "320 rooms · 4 F&B outlets",
    locations: ["Doha, Qatar"],
    highlights: ["Continental and Arabic fine dining"],
    about: "A city-centre property serving business and leisure guests…",
  },
};

export const JOB_EMPLOYER = {
  "commi-2-1792736986-80": "grand-bellevue-doha",
};
```

The job page switches to the full profile automatically — heading, logo,
about, facts grid, highlights, website.

**`EmployerProfile` has no email, phone or contact-person field, by design.**
Candidates are never put in touch with a client directly; every approach runs
through the Innspireo team. Both modes of the component also carry an explicit
"please do not contact the employer directly" note, because a *named* employer
is exactly when someone starts searching for a phone number.

> **Before naming anyone, update the FAQ.** `/faqs` currently answers "Why is
> the employer's name not shown on the job listing?" with the policy that names
> are never published on open listings. Naming one contradicts that answer, so
> `FAQS` in `src/lib/content.ts` has to change at the same time.

---

## Content decisions worth knowing

The rebuild deliberately **does not** carry over three things from the old site:

1. **The testimonials.** All four were fabricated — "Sarah Connor",
   "Michael Scott", "Elon Musk", "Emma Watson" — with claims about Hilton, Taj,
   Radisson and Ritz-Carlton, and one still referenced "Hospitasty", the
   template the site was built from. Nothing replaced them; add real, attributed
   quotes when you have consent.
2. **The marketplace framing.** The old copy advertised employer self-serve
   ("hire the best professionals", "Recruiter tools are extremely effective")
   that has no implementation. `/hire-with-us` replaces it with lead capture,
   which matches how clients are actually onboarded.
3. **The "About Employer" block.** It printed Innspireo's own description —
   "one of the leading global hotel brands" — on all 26 jobs. Innspireo is a
   recruitment LLP, not a hotel brand. Job pages now state plainly that the role
   is managed on behalf of a client employer disclosed at shortlisting.

`/privacy` and `/terms` are drafted from how the site actually operates and
**require the client's legal review before launch.**

---

## Deployment

Any Node host works. For Vercel, the defaults are correct — set
`ENQUIRY_WEBHOOK_URL` (and the auth flag once the backend is ready) as
environment variables.

ISR revalidates job data every 300s, so new vacancies appear within five minutes
without a redeploy. To push them instantly, call `revalidateTag("jobs")` from a
route handler triggered by the backend on publish.
