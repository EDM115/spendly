export type User = {
  id: string;
  username: string;
  role: string;
}

export type Icon = {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export type BudgetTracker = {
  id: string;
  name: string;
  role: string;
}

export type SharedUser = {
  user_id: string;
  username: string;
  role: string;
}

export type Category = {
  id: string;
  name: string;
  icon_id: string;
  icon_name: string;
  icon_color: string;
  icon: string;
}

export type Spending = {
  id: string;
  name: string;
  budget_tracker_id: string;
  value: number;
  is_spending: number;
  category_id: string;
  date: string;
  category_name: string;
  icon_name: string;
  icon_color: string;
  icon: string;
}

export type ErrorType = {
  data?: {
    message: string;
    statusMessage: string;
  };
} | string

export type StoreUser = {
  id: string;
  username: string;
  token: string;
  role: string;
} | null

export type BudgetTrackerRole = "owner" | "admin" | "editor" | "viewer" | null

export type Language = "en" | "fr"

export type Theme = "light" | "dark"
