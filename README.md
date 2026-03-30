# Praxis UI Quickstart

Canonical Angular host for a first adoption path with PraxisUI.

This repository is meant to get a team from zero to a working host quickly:

- Angular standalone host
- `API_URL` pointing to the published `praxis-api-quickstart`
- `PAX_FETCH_HEADERS` carrying tenant and locale
- four core runtimes proving the same remote resource in real flows

## Core path

The main path of this quickstart is intentionally narrow:

1. `praxis-table`
2. `praxis-dynamic-form`
3. `praxis-crud`
4. `praxis-list`

These four examples show the canonical adoption flow. Extra examples remain available as advanced patterns, but they are not the first reading path.

## First 10 minutes

1. Install dependencies and start the app.
2. Confirm the host points to the published API.
3. Open `Table`, `Form`, `CRUD`, and `List`.
4. Verify that all four examples reuse the same `resourcePath`.
5. Use the advanced examples only after the host path is clear.

## The host owns the theme

Praxis provides runtime behavior, metadata interpretation, and governed customization. The host keeps ownership of:

- colors and tokens
- typography
- spacing and density
- company branding

Adopting PraxisUI does not require accepting a proprietary visual skin.

## Public API mode

- origin: `https://praxis-api-quickstart.onrender.com`
- base URL: `https://praxis-api-quickstart.onrender.com/api`
- local app URL: `http://127.0.0.1:4301`

`127.0.0.1:4301` is already allowed in CORS for this published API.

## How to run

```bash
npm install
npm start
```

Then open:

- `http://127.0.0.1:4301`

## What this quickstart demonstrates

1. Canonical bootstrap with `provideHttpClient`, `API_URL`, Praxis providers, and `praxis-table` global pipes.
2. Relative `resourcePath`, because `API_URL` already includes `/api`.
3. Reuse of the same published backend resource in table, form, CRUD, and list.
4. A host-controlled visual system on top of the Praxis runtime.

## Why the install is broader than the first examples

The first reading path is smaller than the full dependency graph. Some `@praxisui/*` packages bring peer dependencies that support the runtime ecosystem even when the first examples do not expose every capability in the top navigation.

That is expected. The adoption path should stay focused even when the package graph is broader.

## Useful files

- `src/app/app.config.ts`: host bootstrap and headers factory
- `src/app/quickstart-content.ts`: snippets, constants, setup steps, and example catalog
- `src/app/pages/home-page.component.ts`: onboarding home
- `src/app/app.html`: shell and top navigation

## Advanced examples

The repository still includes advanced surfaces such as manual form, tabs, stepper, and expansion. They remain useful for exploration, but they are intentionally positioned after the core path.
