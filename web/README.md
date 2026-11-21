# Displate Virtual Wall (web)

Vue app to browse Displate posters and arrange them on a virtual wall at real scale. Local use only.
The full project description, setup and disclaimer are in the [root README](../README.md).

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
src/
├── components/   layout/ and ui/
├── composables/  reusable logic (useX)
├── data/         non-translatable typed data
├── i18n/         setup and locales/{it,en}.json
├── services/     integration with external APIs
├── styles/       design tokens and base styles
├── types/        shared TypeScript types
└── utils/        pure functions
```

## Content

Text lives in `src/i18n/locales/*.json` and must be updated in every language. Non-translatable data
lives in `src/data/*.json`. A unit test compiles every message of every locale.

## Environment variables

See `.env.example`.
