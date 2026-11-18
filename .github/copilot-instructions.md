# Orbital Charms project instructions

## Project shape

- This is a pnpm-managed Next.js App Router application that runs the storefront and Payload
  CMS together. Frontend routes live under [`src/app`](../src/app), Payload collections and
  globals under [`src/collections`](../src/collections) and [`src/globals`](../src/globals), and
  reusable UI under [`src/components`](../src/components).
- Use the `@/*` path alias for imports from `src` (for example, `@/components/...`). Keep
  Payload configuration and server-side data access on the server; add `'use client'` only to
  components that need browser APIs, hooks, or client interactivity.
- Pages use Payload's layout-builder blocks. When adding a block, keep its config and renderer
  together under [`src/blocks`](../src/blocks) and register it in the relevant collection, such
  as [`src/collections/Pages/index.ts`](../src/collections/Pages/index.ts).

## Payload and data changes

- Reuse the existing Payload access-control helpers under [`src/access`](../src/access) for
  collection and field permissions. Preserve the distinction between public published content,
  admins, authenticated customers, and guest order access.
- Extend the existing plugin and collection overrides rather than replacing Payload ecommerce
  defaults. Review [`src/plugins/index.ts`](../src/plugins/index.ts) before changing products,
  orders, payments, storage, SEO, or forms.
- Treat `src/payload-types.ts` as generated output. After changing Payload schemas or fields, run
  `pnpm generate:types`; do not hand-edit the generated file.
- For production schema changes, create a Payload migration with `pnpm payload migrate:create`
  and include the generated migration files under [`src/migrations`](../src/migrations). Do not
  rely on destructive database resets or seed data for a migration.
- Keep secrets and deployment-specific values in environment variables. Use [`.env.example`](../.env.example)
  as the documented variable surface; never commit real credentials, payment keys, database URLs,
  or service-role keys.

## Implementation and testing

- Follow the existing TypeScript, React, Tailwind, and Prettier conventions. Use the existing
  `cn` helper and shared UI components before adding new styling primitives.
- Validate request bodies and authorization at API boundaries. For server routes, return explicit
  `NextResponse` error statuses and log unexpected failures through Payload's logger, following
  [`src/app/(payload)/api/preorders/route.ts`](../src/app/(payload)/api/preorders/route.ts).
- Add or update focused tests for behavior changes. Integration tests belong in
  [`tests/int`](../tests/int) and use Vitest; browser workflows belong in [`tests/e2e`](../tests/e2e)
  and use Playwright.
- Run the smallest relevant checks after changes:
  - `pnpm lint`
  - `pnpm test:int` for Payload/API integration behavior
  - `pnpm test:e2e` for browser behavior (requires the app and configured database/environment)
  - `pnpm build` for changes affecting production compilation or Payload configuration
- If a change modifies generated types, Payload configuration, migrations, authentication,
  checkout, access control, or payment behavior, call out any required environment or migration
  steps in the final summary.
