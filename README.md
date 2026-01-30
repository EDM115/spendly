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
JWT_SECRET=4451b7b6411db0854895824f2fce24721989ac47da45c862cb1baf15383dbc6ef07c1f700304693dde08207bcf75e7e50ad9b146e8bdc4ebf16ade6e6cb9f173
SEED_USERS='[{"username": "admin", "password": "admin", "role": "admin"}, {"username": "test", "password": "test", "role": "user"}]'
SEED=false
DEFAULT_UI_LANG=en
DB_FILE_NAME=db/data.db
```
- `JWT_SECRET` : generate with `node -e "import('crypto').then(crypto => console.log(crypto.randomBytes(64).toString('hex')))"`
- `SEED_USERS` : if any value should contain a quote, write instead `\'` (or `\"`)
- `SEED` : protection so Nuxt doesn't accidentally re-seed in dev mode as it runs the file for some reason
- `DEFAULT_UI_LANG` : the default language of the UI, either `en` or `fr`
- `DB_FILE_NAME` : the path to the SQLite database file, please keep as-is
```pwsh
pnpm db:migrate
pnpm seed
pnpm i --frozen-lockfile
pnpm dev
```

### Build and run
```pwsh
docker build -t edm115/spendly .
docker run -d -p 60000:60000 --env-file .env -v spendly_db:/app/db --name spendly edm115/spendly
```

<details><summary><h3>DB Schema</h3></summary>

#### User
| Column   | Type   | Extra                                 |
| :------- | :----- | :------------------------------------ |
| id       | string | Primary Key, UUIDv4                   |
| username | string | Not Null, Unique                      |
| password | string | Not Null                              |
| role     | string | Not Null, "admin" or "user" (default) |

#### BudgetTracker
| Column | Type   | Extra               |
| :----- | :----- | :------------------ |
| id     | string | Primary Key, UUIDv4 |
| name   | string | Not Null            |

#### BudgetTracker
| Column            | Type   | Extra                            |
| :---------------- | :----- | :------------------------------- |
| user_id           | string | Primary Key, Foreign Key, UUIDv4 |
| budget_tracker_id | string | Primary Key, Foreign Key, UUIDv4 |
| role              | string | Not Null, default "viewer"       |

#### Category
| Column            | Type   | Extra                 |
| :---------------- | :----- | :-------------------- |
| id                | string | Primary Key, UUIDv4   |
| name              | string | Not Null              |
| icon              | string | Not Null              |
| color             | string | Not Null              |
| budget_tracker_id | string | Not Null, Foreign Key |

#### Spending
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
  User {
    TEXT id PK
    TEXT username
    TEXT password
    TEXT role
  }

  BudgetTracker {
    TEXT id PK
    TEXT name
  }

  UserBudgetTracker {
    TEXT user_id PK FK
    TEXT budget_tracker_id PK FK
    TEXT role
  }

  Category {
    TEXT id PK
    TEXT name
    TEXT icon
    TEXT color
    TEXT budget_tracker_id FK
  }

  Spending {
    TEXT id PK
    TEXT name
    TEXT budget_tracker_id FK
    REAL value
    BOOLEAN is_spending
    TEXT category_id FK
    DATETIME date
  }

  User ||--o{ UserBudgetTracker : participates
  BudgetTracker ||--o{ UserBudgetTracker : has
  BudgetTracker ||--o{ Spending : contains
  BudgetTracker ||--o{ Category : has
  Category ||--o{ Spending : classifies
```

</details>
