# Kubo real-estate website concept

Kubo is a private, mobile-first clickable concept for first-time family homebuyers in Greater Manila. It demonstrates a bilingual, explainable way to narrow 48 deterministic fictional homes, compare trade-offs, learn due-diligence questions, and walk through a simulated seller/moderator flow.

> **Prototype boundary:** every property, seller, credential, coordinate, image, submission, and moderation result is fictional. Nothing is for sale. No form data or file contents leave the browser. “Kubo” is a private codename and mascot, not a cleared public brand.

## Run locally

Requirements: Node.js 22.13+ and [Bun](https://bun.sh/).

```bash
bun install
bun run dev
```

Open the local URL printed by the development server.

## Quality commands

```bash
bun run lint
bun run typecheck
bun run test
bun run test:e2e
bun run build
```

For a browser pass against the production bundle without Cloudflare local bindings, run `bun run build` and then `bun run qa:serve`.

The Playwright command starts the site on port 3100 and requires a locally installed Chromium browser (`bunx playwright install chromium` if it is not already available).

## What is implemented

- Four-scene, sticky-scrolling Kubo introduction with scroll-scrubbed desktop and native portrait video chains, skip control, and a still-image reduced-motion path.
- English-by-default UI with a manually authored Filipino toggle for the primary journeys.
- Six-group guided matcher for comfortable housing budget/cash, areas and commute anchor, household/bedrooms, property type, timing, and priorities.
- Visible before/after counts, removable filter steps, deterministic 100-point breakdown, plain-language reasons, and exact zero-result recovery counts.
- Search with manual filters, sorting, synchronized list/map inventory, OpenStreetMap attribution, saved homes, and up-to-three comparison.
- Fictional property details with an editable principal-and-interest estimate based on 20% down, 7% annual interest, and a 20-year term by default.
- Plain-language learning content and official starting links for DHSUD, PRC, and LRA checks.
- Local seller submission, filenames-only media/evidence simulation, moderation controls, seller status, and visible reset-demo control.
- Versioned `localStorage` for language, guide answers, favorites, comparison, seller draft, and moderation state.

## Deterministic data and matching

`lib/listings.ts` creates exactly three property types for each of 16 Greater Manila pilot locations: 48 synthetic homes across Metro Manila, Cavite, Laguna, Rizal, and Bulacan. Coordinates are synthetic offsets for prototype visualization and must not be reused as production listing locations.

Hard constraints are the estimated price ceiling, selected areas, minimum bedrooms, and accepted property types. Surviving homes are ranked with fixed weights:

- location and illustrative commute: 30
- budget comfort: 25
- usable space: 15
- readiness/timing: 10
- parking/accessibility: 10
- selected family priorities: 10

The score is fit against a household’s answers—not property quality, investment return, a mortgage decision, or professional advice.

## Visual workflow

The scene plan follows the MIT-licensed [`scroll-world`](https://github.com/oso95/scroll-world) workflow for scene continuity, native portrait/landscape prompts, ordering, and asset compatibility. Four landscape and four native portrait scene dives were generated with Higgsfield Seedance 2.0 at 720p, then encoded with short GOPs and `faststart` for responsive scroll seeking. The production-ready chains are in `public/videos/scroll-world/`; the larger source renders and review frames are retained locally in the git-ignored `artifacts/scroll-world/` folder and are not served by the site.

The one-day Unlimited editor exposed two selected images as generic Seedance "Mix" references, not as explicitly labeled Start Frame and End Frame slots. Because that does not guarantee frame-locked interpolation, this concept does **not** claim genuine continuous camera-flight connectors. The six five-second connectors are local ffmpeg dissolves anchored to the actual outgoing last frame and incoming first frame. A future pass can replace them one-for-one when a model or Higgsfield workflow exposes guaranteed start/end-frame controls.

The illustrations in `public/images/` and all video inputs were generated for this prototype and do not reuse marketplace photography or real listing data. `ffmpeg-static` is a development dependency used only for local asset preparation; the browser does not run ffmpeg.

## Prototype-only technology choices

- Next.js App Router, TypeScript, React, Tailwind CSS, and Motion
- React Leaflet with OpenStreetMap tiles and required attribution
- Vitest for deterministic logic tests
- Playwright and axe for browser-flow and accessibility checks
- local browser storage only; no auth, API, database, uploads, messaging, payment, or deployment

Production maps need a selected commercial/provider arrangement, compliant tile usage, and authoritative property data. Public launch also needs a cleared brand, privacy/security work, legal review, real moderation operations, and usability testing with 5–8 first-time Greater Manila buyers.

## Official due-diligence starting points

- [DHSUD buyer guidance](https://dhsud.gov.ph/buyers-awareness-rights-and-general-remedies-hred-faqs/)
- [PRC professional verification](https://verification.prc.gov.ph/)
- [Land Registration Authority FAQs](https://lra.gov.ph/frequently-asked-questions/)

## Future 3D-tour research

[`LingBot-Map`](https://github.com/robbyant/lingbot-map) is reserved as a separate future GPU worker, not included as a browser dependency. Its Python/PyTorch/CUDA pipeline reconstructs streaming video into point-cloud geometry and camera poses; it is not a guaranteed photorealistic mesh generator. A responsible future flow would require an authorized walkthrough, asynchronous processing, failure/retry states, human review, and a separately implemented browser viewer.

See [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md) for repository license notes.
