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
```
- `JWT_SECRET` : generate with `node -e "import('crypto').then(crypto => console.log(crypto.randomBytes(64).toString('hex')))"`
- `SEED_USERS` : if any value should contain a quote, write instead `\'` (or `\"`)
- `SEED` : protection so Nuxt doesn't accidentally re-seed in dev mode as it runs the file for some reason
- `DEFAULT_UI_LANG` : the default language of the UI, either `en` or `fr`
- `DB_FILE_NAME` : the path to the SQLite database file, please keep as-is
- `BETTER_AUTH_SECRET` : same as `JWT_SECRET`
- `BETTER_AUTH_URL` : the base URL of Spendly, port 8888 in dev and 60000 by default in prod, change with the proper URL
- `RESEND_API_KEY` : to send emails
- `GITHUB_CLIENT_ID` & `GITHUB_CLIENT_SECRET` : for GitHub OAuth
- `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET` : for Google OAuth
- `TURNSTILE_SITE_KEY` & `TURNSTILE_SECRET_KEY` : for Cloudflare Turnstile CAPTCHA
```pwsh
pnpm i --frozen-lockfile
pnpm db:migrate
pnpm db:seed
pnpm dev
```

### On Drizzle DB schema/Better Auth config changes
```pwsh
pnpm better-auth:generate
# diff shared/db/auth.schema.ts with shared/db/schema.ts and update the Better Auth tables accordingly
pnpm db:generate
pnpm db:migrate
```

### Build and run
```pwsh
docker build -t edm115/spendly .
docker run -d -p 60000:60000 --env-file .env -v spendly_db:/app/db --name spendly edm115/spendly
```

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
