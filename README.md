# spendly
**WIP** A budget tracker with tables, stats and charts. Made for my gf

## DB Schema

```mermaid
erDiagram
  User {
    TEXT id PK
    TEXT username
    TEXT password
    TEXT role
  }

  Icon {
    TEXT id PK
    TEXT name
    TEXT color
    TEXT icon
  }

  BudgetTracker {
    TEXT id PK
    TEXT name
  }

  UserBudgetTracker {
    TEXT user_id FK
    TEXT budget_tracker_id FK
    TEXT role
  }

  Category {
    TEXT id PK
    TEXT name
    TEXT icon_id FK
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
  Category ||--o{ Spending : classifies
  Icon ||--o{ Category : represents
```
