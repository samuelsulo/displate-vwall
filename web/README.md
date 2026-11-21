# Displate Virtual Wall (web)

Vue app to browse Displate posters and arrange them on a virtual wall at real scale. Local use only.
The project description, quick start and disclaimer are in the [root README](../README.md); this file
documents the app itself.

## Technology stack

- Vue 3 (Composition API, `<script setup>`) + TypeScript in strict mode
- Vite as the build tool
- vue-i18n (Italian default, English)
- Vitest + Vue Test Utils for unit tests
- ESLint (with oxlint) + Prettier

No Pinia, Vue Router or Vuetify: one view, shared state in composables.

## Requirements

Node 24 (pinned in the root `mise.toml`: run `mise install`).

```bash
npm install
```

## Available scripts

```bash
npm run dev           # dev server with hot reload
npm run build         # type-check + production build into dist/
npm run preview       # preview of the production build
npm test              # unit tests (single run)
npm run test:watch    # unit tests in watch mode
npm run type-check    # type-check only (vue-tsc)
npm run lint          # oxlint + ESLint
npm run format        # Prettier on src/
npm run format:check  # Prettier check, used by CI
```

## Project structure

```text
proxy/            Vite plugin: Displate search proxy, rate limiter, query validation
src/
├── components/   cookies/, layout/, search/, ui/ and wall/
├── composables/  state and reusable logic (useWall, usePosterSearch, useCookieConsent, ...)
├── data/         non-translatable typed data (poster sizes, cookie categories)
├── i18n/         setup and locales/{it,en}.json
├── services/     Displate search service and wall storage
├── styles/       design tokens and base styles
├── types/        shared TypeScript types
└── utils/        pure functions (placement, sizes, summary, debounce)
```

## Content

Text lives in `src/i18n/locales/*.json` and must be updated in every language. Non-translatable data
lives in `src/data/*.json`. A unit test compiles every message of every locale.

## Environment variables

See `.env.example`.

## Cookie consent and privacy

- The app sets no cookies. It stores only necessary data in localStorage: language, wall layout and the
  consent choice. No analytics, no tracking, no third-party scripts.
- Consent banner (accept and reject with the same prominence) and preferences modal, reopenable from the
  footer link. Cookie Policy and Privacy Policy open as modals from the footer.
- The only category is `necessary` (`src/data/cookie-categories.json`). If a new category is ever added,
  bump `CONSENT_VERSION` in `src/composables/useCookieConsent.ts` so visitors are asked again.

## Displate proxy

The Displate search API sends no CORS headers, so `npm run dev` and `npm run preview` start a small proxy
(`proxy/`, a Vite plugin) that forwards the search for the browser.

- Only `GET /displate-api/search` is forwarded, to `https://displate.com/elysium-api/user/v9/search`.
  Any other path under `/displate-api/` is a 404: it is not an open relay.
- Only `phrase` (1 to 100 characters), `size` (capped at 60) and `page` (1 to 100) are forwarded; any other
  query parameter is dropped.
- Rate limit: a token bucket of 20 requests per minute. Beyond it the proxy answers `429` with `Retry-After`.
- The dev and preview servers listen on `127.0.0.1` only and the proxy refuses non-loopback clients.
- The anonymous visitor id that the Displate search requires is a random UUID generated at each start.
