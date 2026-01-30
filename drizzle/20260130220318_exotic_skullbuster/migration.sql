CREATE TABLE `BudgetTracker` (
	`id` text PRIMARY KEY,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `Category` (
	`id` text PRIMARY KEY,
	`name` text NOT NULL,
	`icon` text NOT NULL,
	`color` text NOT NULL,
	`budget_tracker_id` text NOT NULL,
	CONSTRAINT `fk_Category_budget_tracker_id_BudgetTracker_id_fk` FOREIGN KEY (`budget_tracker_id`) REFERENCES `BudgetTracker`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `Spending` (
	`id` text PRIMARY KEY,
	`name` text NOT NULL,
	`budget_tracker_id` text NOT NULL,
	`value` real NOT NULL,
	`is_spending` integer DEFAULT true NOT NULL,
	`category_id` text NOT NULL,
	`date` text NOT NULL,
	CONSTRAINT `fk_Spending_budget_tracker_id_BudgetTracker_id_fk` FOREIGN KEY (`budget_tracker_id`) REFERENCES `BudgetTracker`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_Spending_category_id_Category_id_fk` FOREIGN KEY (`category_id`) REFERENCES `Category`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `User` (
	`id` text PRIMARY KEY,
	`username` text NOT NULL UNIQUE,
	`password` text NOT NULL,
	`role` text DEFAULT 'user' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `UserBudgetTracker` (
	`user_id` text NOT NULL,
	`budget_tracker_id` text NOT NULL,
	`role` text DEFAULT 'viewer' NOT NULL,
	CONSTRAINT `UserBudgetTracker_pk` PRIMARY KEY(`user_id`, `budget_tracker_id`),
	CONSTRAINT `fk_UserBudgetTracker_user_id_User_id_fk` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_UserBudgetTracker_budget_tracker_id_BudgetTracker_id_fk` FOREIGN KEY (`budget_tracker_id`) REFERENCES `BudgetTracker`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE INDEX `category_budget_tracker_id_idx` ON `Category` (`budget_tracker_id`);--> statement-breakpoint
CREATE INDEX `spending_tracker_date_idx` ON `Spending` (`budget_tracker_id`,`date`);--> statement-breakpoint
CREATE INDEX `spending_category_id_idx` ON `Spending` (`category_id`);--> statement-breakpoint
CREATE INDEX `ubt_budget_tracker_id_idx` ON `UserBudgetTracker` (`budget_tracker_id`);