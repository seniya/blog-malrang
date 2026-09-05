PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_posts` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`excerpt` text DEFAULT '' NOT NULL,
	`content` text NOT NULL,
	`cover_image_url` text,
	`status` text DEFAULT 'draft' NOT NULL,
	`published_at` integer,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	CONSTRAINT "posts_status_check" CHECK("__new_posts"."status" in ('draft', 'published')),
	CONSTRAINT "posts_published_at_check" CHECK(("__new_posts"."status" = 'published' and "__new_posts"."published_at" is not null) or ("__new_posts"."status" = 'draft' and "__new_posts"."published_at" is null))
);
--> statement-breakpoint
INSERT INTO `__new_posts`("id", "title", "slug", "excerpt", "content", "cover_image_url", "status", "published_at", "created_at", "updated_at") SELECT "id", "title", "slug", "excerpt", "content", "cover_image_url", "status", "published_at", "created_at", "updated_at" FROM `posts`;--> statement-breakpoint
DROP TABLE `posts`;--> statement-breakpoint
ALTER TABLE `__new_posts` RENAME TO `posts`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `posts_slug_unique` ON `posts` (`slug`);--> statement-breakpoint
CREATE INDEX `posts_status_published_at_idx` ON `posts` (`status`,`published_at`);