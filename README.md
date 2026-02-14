<div align="center">

<picture>
  <source width="300" height="300" media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/EDM115/spendly/master/public/images/logo.webp">
  <source width="300" height="300" media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/EDM115/spendly/master/public/images/logo_alt.webp">
  <img alt="Spendly" width="300" height="300" src="https://raw.githubusercontent.com/EDM115/spendly/master/public/images/logo.webp">
</picture>

# spendly
**WIP**  
Simple, powerful, and free budget tracking for everyone with tables, stats and charts.  
Made for my gf

</div>

## What is it ?
...

## User documentation
Hi :wave:  
...

## Developer documentation
### Get started
```pwsh
git clone https://github.com/EDM115/spendly.git
cd spendly
```
Create a `.env` file in the root directory and add the following variables :
```env
JWT_SECRET=0x0x0x
SEED_USERS='[{"email": "admin@example.test", "username": "admin", "password": "admin", "role": "admin"}, {"email": "user@example.test", "username": "test", "password": "test", "role": "user"}]'
SEED=false
DEFAULT_UI_LANG=en
DB_FILE_NAME=db/data.db
BETTER_AUTH_SECRET=x0x0x0
BETTER_AUTH_URL=http://localhost:8888
RESEND_API_KEY=re_xxxxxxxxx
GITHUB_CLIENT_ID=xxxx
GITHUB_CLIENT_SECRET=xxxx0000
GOOGLE_CLIENT_ID=0000-xxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxxx-0000-xxxx-
TURNSTILE_SITE_KEY=0x4AAAAAA00
TURNSTILE_SECRET_KEY=0x4AAAAAA00-XX
SERVICE_NAME=spendly
SERVICE_VERSION=0.16.0
LOG_LEVEL=info
LOG_INCLUDE_UA=true
LOG_INCLUDE_IP=true
STAGE=development
ALERT_API=https://alert.service/send?token=xxxx&message=
```
**Required** :
- `JWT_SECRET` : generate with `node -e "import('crypto').then(crypto => console.log(crypto.randomBytes(64).toString('hex')))"`
- `SEED_USERS` : if any value should contain a quote, write instead `\'` (or `\"`)
- `SEED` : enables database seeding when the app boots. In Docker, leave this to `true` so the first run seeds an empty volume (seeding is skipped if data already exists)
- `DEFAULT_UI_LANG` : the default language of the UI, either `en` or `fr`
- `DB_FILE_NAME` : the path to the SQLite database file, please keep as-is
- `BETTER_AUTH_SECRET` : same as `JWT_SECRET`
- `BETTER_AUTH_URL` : the base URL of Spendly, port 8888 in dev and 60000 by default in prod, change with the proper URL
- `RESEND_API_KEY` : to send emails
- `GITHUB_CLIENT_ID` & `GITHUB_CLIENT_SECRET` : for GitHub OAuth
- `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET` : for Google OAuth
- `TURNSTILE_SITE_KEY` & `TURNSTILE_SECRET_KEY` : for Cloudflare Turnstile CAPTCHA
**Optional** :
- `SERVICE_NAME` : service identifier in logs (defaults to `spendly`)
- `SERVICE_VERSION` : release/version tag to include in logs
- `LOG_LEVEL` : pino log level (ex `debug`, `info`, `warn`, `error`)
- `LOG_INCLUDE_UA` : set to `true` to include user-agent in request logs (default `false`)
- `LOG_INCLUDE_IP` : set to `true` to include client IP in request logs (default `false`)
- `STAGE` : override log environment (`production`, `staging`, `development`), defaults to `NODE_ENV`
- `ALERT_API` : an API endpoint to send alerts to when an email have been sent (to monitor its usage as it ain't free), the error message will be appended to the URL (ex: `https://alert.service/send?token=xxxx&message=`)
```pwsh
pnpm i --frozen-lockfile
pnpm db:migrate
pnpm db:seed
pnpm dev
```

### PWA (Vite PWA / Nuxt)
- Spendly uses `@vite-pwa/nuxt` with a generated Web App Manifest and service worker.
- PWA head entries (`manifest`, icons, `theme-color`) are injected through `NuxtPwaAssets` in `app/layouts/default.vue`.
- Icon assets are generated from `public/images/logo.webp` via the `pwaAssets` integration.
- Service worker update mode is configured as `prompt` to avoid forced reload while users are editing data.

### Log analysis (CLI + TUI)
Capture logs to a file (Docker example) :
```pwsh
docker logs spendly > logs/spendly.log
```

Follow logs and save them while you reproduce an issue :
```pwsh
docker logs -f spendly | Tee-Object -FilePath logs/spendly.log
```
```bash
docker logs -f spendly | tee logs/spendly.log
```

Capture dev server logs (when you pipe, JSON is emitted because the logger disables pretty output in non-TTY mode) :
```pwsh
pnpm dev | Tee-Object -FilePath logs/spendly.log
```

Analyze logs (CLI summary + JSON report) :
```pwsh
pnpm log:analyze --file logs/spendly.log
```

Analyze directly from stdin :
```pwsh
cat logs/spendly.log | pnpm log:analyze
```

Useful flags :
- `--duration-kind request|ui|system` : choose which kind feeds duration stats/slowest
- `--no-output` : skip writing the JSON report to disk
- `--json logs/log-report.json` : write the JSON report to a custom path

Interactive TUI (requires a file path and a TTY) :
```pwsh
pnpm log:tui --file logs/spendly.log
```

TUI controls :
- Tabs: `1` Overview, `2` Filters, `3` Drilldown
- Drilldown: `↑/↓` move, `/` search, `Esc` clear search
- Filters: `f/t/e/s/k/o/h/a/d/x` to edit/clear filters
- `r` refresh, `q` quit

### On Drizzle DB schema/Better Auth config changes
```pwsh
pnpm better-auth:generate
# diff shared/db/auth.schema.ts with shared/db/schema.ts and update the Better Auth tables accordingly
pnpm db:generate
pnpm db:migrate
```

### Build and run (Docker Compose - recommended)
```pwsh
docker compose up -d --build
```

#### Redeploy (rebuild without data loss)
```pwsh
docker compose up -d --build --force-recreate
```

#### Remove container but keep data
```pwsh
docker compose down
```

### Build and run (Docker CLI)
```pwsh
docker build -t edm115/spendly .
docker run -d -p 60000:60000 --env-file .env -v spendly_db:/app/db --name spendly edm115/spendly
```

#### Redeploy (rebuild without data loss)
```pwsh
docker stop spendly && docker rm spendly && docker rmi edm115/spendly
docker build -t edm115/spendly .
docker run -d -p 60000:60000 --env-file .env -v spendly_db:/app/db --name spendly edm115/spendly
```

#### Notes
- Database migrations run automatically at container startup
- Seeding runs only when `SEED=true` **and** the database is empty

<details><summary><h3>DB Schema</h3></summary>

#### budget_tracker
| Column | Type   | Extra               |
| :----- | :----- | :------------------ |
| id     | string | Primary Key, UUIDv4 |
| name   | string | Not Null            |

#### user_budget_tracker
| Column            | Type   | Extra                            |
| :---------------- | :----- | :------------------------------- |
| user_id           | string | Primary Key, Foreign Key, UUIDv4 |
| budget_tracker_id | string | Primary Key, Foreign Key, UUIDv4 |
| role              | string | Not Null, default "viewer"       |

#### category
| Column            | Type   | Extra                 |
| :---------------- | :----- | :-------------------- |
| id                | string | Primary Key, UUIDv4   |
| name              | string | Not Null              |
| icon              | string | Not Null              |
| color             | string | Not Null              |
| budget_tracker_id | string | Not Null, Foreign Key |

#### spending
| Column            | Type    | Extra                  |
| :---------------- | :------ | :--------------------- |
| id                | string  | Primary Key, UUIDv4    |
| name              | string  | Not Null               |
| budget_tracker_id | string  | Not Null, Foreign Key  |
| value             | float   | Not Null               |
| is_spending       | boolean | Not Null, default true |
| category_id       | string  | Foreign Key, Not Null  |
| date              | date    | Not Null               |

#### Mermaid diagram

```mermaid
erDiagram
  budget_tracker {
    TEXT id PK
    TEXT name
  }

  user_budget_tracker {
    TEXT user_id PK FK
    TEXT budget_tracker_id PK FK
    TEXT role
  }

  category {
    TEXT id PK
    TEXT name
    TEXT icon
    TEXT color
    TEXT budget_tracker_id FK
  }

  spending {
    TEXT id PK
    TEXT name
    TEXT budget_tracker_id FK
    REAL value
    BOOLEAN is_spending
    TEXT category_id FK
    DATETIME date
  }

  budget_tracker ||--o{ user_budget_tracker : has
  budget_tracker ||--o{ spending : contains
  budget_tracker ||--o{ category : has
  category ||--o{ spending : classifies
```

</details>
