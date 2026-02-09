# Spendly AI Agent Guide

## App goal
Spendly is a free, open-source personal finance tracker. Users create budget trackers, manage categories and transactions, visualize analytics with charts, and share trackers with other users. It supports demo mode, admin tooling, and data export.

## Architecture overview
- Nuxt 4 SSR app with Vuetify UI, Pinia store, and Vue 3 Composition API. Frontend in `app/`, server API in `server/api/`, shared types and DB schema in `shared/`.
- Authentication via Better Auth with email/password, username, magic links, admin plugin, and social providers (GitHub/Google). Cloudflare Turnstile protects auth endpoints.
- Data stored in SQLite via Drizzle ORM (`better-sqlite3`). DB runs in WAL mode. IDs are UUIDv4 (`randomUUID()`).
- Charts built with Chart.js + `vue-chartjs`; exports to SVG/PNG/PDF using `canvas-to-svg` and `jspdf`.
- i18n via `@nuxtjs/i18n` with `en`/`fr` messages; Vuetify locales merged in `i18n/locales/*.ts`.

## Key workflows & commands
- Dev server: `pnpm dev` (port 8888). Also `pnpm dev:expose:local` / `pnpm dev:expose:global`.
- Build/preview/start: `pnpm build`, `pnpm preview` (port 88), `pnpm start` (dotenvx).
- DB: `pnpm db:generate`, `pnpm db:migrate`, `pnpm db:seed` (seed uses `init/seed_db.ts`).
- Auth schema changes: `pnpm better-auth:generate` → diff `shared/db/auth.schema.ts` vs `shared/db/schema.ts` → `pnpm db:generate` + `pnpm db:migrate`.
- Lint/format/typecheck: `pnpm lint`, `pnpm lint:fix`, `pnpm format`, `pnpm typecheck`.

## Product flows
### Auth & session
- `server/middleware/auth.ts` resolves Better Auth session and sets `event.context.auth` (see `server/utils/session.ts`).
- Client routes guarded by `app/middleware/auth.global.ts` (protects `/app`, `/admin`, `/account`).
- `authClient` (`app/utils/authClient.ts`) provides session-aware client API calls.

### Budget tracker lifecycle
- Create/edit/delete budget trackers and manage user access (roles: viewer/editor/admin/owner).
- Category and spending CRUD is scoped to a selected tracker.
- Role checks enforced server-side

### Exports
- Transactions export to CSV/JSON in `SpendingTable`.
- Charts export to SVG/PNG/PDF in `Charts`.
- Admin exports: DB backup (`server/api/admin/dbExport.ts`) and per-user ZIP export (`server/api/admin/userExport.ts`).

## Data model (SQLite/Drizzle)
Core tables (see `shared/db/schema.ts`):
- Better Auth: `user`, `session`, `account`, `verification`.
- Spendly: `budget_tracker`, `user_budget_tracker` (role per user+tracker), `category`, `spending`.

## API surface (server)
All API handlers return `{ status, body }` and use `requireUserId(event.context.auth)` where auth is required.
- `GET/POST/PUT/DELETE /api/budgetTracker`: list/detail, create, rename, delete.
- `GET/POST/PUT/DELETE /api/category`: list/detail, create, update, delete.
- `GET/POST/PUT/DELETE /api/spending`: list/detail, create, update, delete (supports date range filtering).
- `GET/POST/PUT/DELETE /api/budgetTracker/users`: manage shared users and roles.
- `POST /api/budgetTracker/transferOwnership`: transfer tracker ownership.
- `GET /api/admin/dbExport`: admin-only DB export (csv/json/sql/sqlite).
- `GET /api/admin/userExport`: admin-only user ZIP export.
- `server/api/auth/[...all].ts`: Better Auth entrypoint.

## Frontend structure
### Pages (`app/pages`)
- `index.vue`: landing page with marketing content and redirect for authenticated users.
- `login.vue`, `signup.vue`, `reset-password.vue`: auth flows + Turnstile.
- `app.vue`: main app shell (tracker selection, spendings, categories, charts).
- `account.vue`: profile, email change, password change, OAuth linking, data export/delete request.
- `admin.vue`: admin settings and user management.
- `demo.vue`: demo-only data and UI (no server mutations).
- `privacy-policy.vue`, `terms-of-use.vue`: legal pages.
- `error.vue` + `app/error.vue`: error handling and fallback UI.

### Components (`app/components`)
- `App/BudgetTrackerSelector.vue`: tracker CRUD + user sharing + ownership transfer.
- `App/CategoryManager.vue`: category CRUD with icons/colors.
- `App/SpendingTable.vue`: transactions CRUD, balance summaries, export (CSV/JSON).
- `App/Charts.vue`: analytics charts + export (SVG/PNG/PDF).
- `App/DateRangeFilter.vue`: time range controls.
- `Layout/NavBar.vue`: navigation, theme/language toggles, admin/account links, impersonation stop.
- `Layout/Alert.vue`: UI notifications.
- `Admin/Settings.vue`: user CRUD, impersonation, exports.
- `Auth/*`: login/signup/reset form logic.

### Store & composables
- `app/stores/main.ts`: i18n/theme state (localStorage), demo flag, session/user, selected tracker + role, permission helpers (`canEditData`, `canManageUsers`, etc.).
- `app/composables/useCustomTheme.ts`: syncs Vuetify theme with store and provides toggle.

### Utilities
- `app/utils/authClient.ts`: Better Auth client helpers (session + requests).
- `app/utils/dateWindow.ts`: date range handling and formatting.
- `app/router.options.ts`: Nuxt router settings.

## i18n
- `i18n/i18n.config.ts` wires locales and messages.
- `i18n/locales/en.json`, `fr.json`: UI strings.
- `i18n/locales/en.ts`, `fr.ts`: merge Vuetify locales (`$vuetify`) with app strings.

## Config & tooling
- `nuxt.config.ts`: SSR, i18n, Vuetify themes, fonts, dev server port (8888), runtime config for Turnstile site key.
- `drizzle.config.ts`: DB connection via `DB_FILE_NAME`.
- `Dockerfile`: multi-stage build, seeds DB, runs Nuxt output with dotenv.

## Environment variables
See `README.md` for the canonical list. Key variables used in this app:
- `DB_FILE_NAME`, `DEFAULT_UI_LANG`
- `BETTER_AUTH_URL`, `BETTER_AUTH_SECRET`, `JWT_SECRET`
- `TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`
- `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- `RESEND_API_KEY`
- `SEED`, `SEED_USERS` (seed data control)

## Patterns & conventions
- Always gate write operations with role checks; owners/admins can manage users/trackers, editors can edit data.
- Prefer `event.context.auth` from middleware and `requireUserId` for authorization.
- API responses are shaped as `{ status, body }`.
- Persist UI settings (`theme`, `i18n`, `selectedBudgetTrackerId`) in localStorage.

## Contribution rules
- No tests are needed in this app. Vitest is not set up and does not need to be; TDD is not required.
- Do not create git worktrees; work directly on the current branch.
- Numerous Skills are available to work better, faster and safer on this codebase. Use them as much as you need, but do not rely on them blindly. Always review their suggestions and ensure they align with the project conventions and best practices.
- Do not stage files or create commits. Leave that to the user. If needed, suggest a commit name/description only.
- Run commands as `pnpm <command>`. If adding/editing dependencies, update `package.json` with the tilde (`~`) version range and run `pnpm up -L` to update the lockfile (do not use `pnpm i` or `pnpm add`).
- This is a Nuxt 4 app using Vue 3, Composition API, TypeScript, and Vite.
- Linting is primarily `oxlint`, with ESLint Stylistic for formatting.
- The site supports dark and light mode. Maintain legibility across both. Vuetify colors are defined in `nuxt.config.ts` and must not be changed unless the user explicitly agrees.
- Write all code in TypeScript. No JavaScript. Top-level await is allowed. Styles must be SCSS, using SCSS features when possible (e.g., nesting).
- Use function declarations instead of arrow functions unless absolutely necessary.
- Vue files must be SFCs ordered as `<template>`, then `<script setup lang="ts">`, then `<style scoped lang="scss">` (rarely not scoped).
- Do not use `any` or disable typechecking. Prefer proper typing; use `unknown` with narrowing as a last resort.
- Add comments for complex logic or non-obvious decisions. More comments are welcome.
- Do not manually import Vue/Nuxt/VueUse components/composables/directives/functions. Nuxt auto-imports them. Component names follow folder structure (e.g., `app/components/Auth/Login.vue` → `AuthLogin`).
- Prefer VueUse utilities over raw HTML/JS where possible.
- Prioritize performance: avoid heavy main-thread work, large dependencies, and unnecessary re-renders. Offload heavy tasks to workers or async/parallel processing and heed oxlint performance warnings.

## Testing guidance
- For verification, run `pnpm typecheck` first, then `pnpm lint:oxlint`.
- Only for large features: run `pnpm typecheck`, fix all errors; run `pnpm lint`, fix all errors/warnings; run `pnpm format`; then provide a detailed summary with examples if useful.

## File tree (selected)
```
app/
	components/
		Admin/Settings.vue
		App/BudgetTrackerSelector.vue
		App/CategoryManager.vue
		App/Charts.vue
		App/DateRangeFilter.vue
		App/SpendingTable.vue
		Auth/Login.vue
		Auth/ResetPassword.vue
		Auth/SignUp.vue
		Layout/Alert.vue
		Layout/NavBar.vue
	composables/useCustomTheme.ts
	layouts/default.vue
	middleware/auth.global.ts
	pages/*.vue
	stores/main.ts
	utils/authClient.ts
	utils/dateWindow.ts
server/
	api/
		admin/dbExport.ts
		admin/userExport.ts
		auth/[...all].ts
		budgetTracker.ts
		budgetTracker/transferOwnership.ts
		budgetTracker/users.ts
		category.ts
		spending.ts
	middleware/auth.ts
	plugins/gracefulShutdown.ts
	utils/auth.ts
	utils/email.ts
	utils/session.ts
shared/
	db/schema.ts
	db/drizzle.ts
	db/auth.schema.ts
	types/*.ts
i18n/
	i18n.config.ts
	locales/en.json
	locales/fr.json
	locales/en.ts
	locales/fr.ts
```

## Where to look first
- UI + pages: `app/pages/`, `app/components/`.
- Auth + session: `server/utils/auth.ts`, `server/middleware/auth.ts`, `app/middleware/auth.global.ts`.
- Data + API: `shared/db/schema.ts`, `server/api/*.ts`.

## Extras
> *Anything under this quote is a free space for any AI agent to write tips, gotchas, rules, ... that they might find interesting to memorize as they work on the project. Feel free to add anything useful here, as an unordered list. Do not remove exitsing entries unless they are no longer relevant. This file is a living documentation of the project, dedicated to AI agents, and is made to evolve along with the project, as many times as necessary.*
