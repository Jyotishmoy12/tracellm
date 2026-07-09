CREATE TABLE IF NOT EXISTS `sessions` (
  `id` text PRIMARY KEY NOT NULL,
  `trace_id` text NOT NULL,
  `name` text NOT NULL,
  `user_id` text,
  `service_name` text NOT NULL,
  `status` text NOT NULL,
  `started_at` text NOT NULL,
  `ended_at` text,
  `duration_ms` integer,
  `input` text,
  `output` text,
  `attributes` text NOT NULL,
  `created_at` text NOT NULL,
  `updated_at` text NOT NULL
);
CREATE TABLE IF NOT EXISTS `spans` (
  `id` text PRIMARY KEY NOT NULL,
  `session_id` text NOT NULL,
  `trace_id` text NOT NULL,
  `parent_span_id` text,
  `name` text NOT NULL,
  `kind` text NOT NULL,
  `status` text NOT NULL,
  `started_at` text NOT NULL,
  `ended_at` text,
  `duration_ms` integer,
  `input` text,
  `output` text,
  `attributes` text NOT NULL,
  `created_at` text NOT NULL,
  `updated_at` text NOT NULL,
  FOREIGN KEY (`session_id`) REFERENCES `sessions`(`id`)
);
CREATE TABLE IF NOT EXISTS `events` (
  `id` text PRIMARY KEY NOT NULL,
  `session_id` text NOT NULL,
  `span_id` text,
  `name` text NOT NULL,
  `attributes` text NOT NULL,
  `occurred_at` text NOT NULL,
  `created_at` text NOT NULL,
  FOREIGN KEY (`session_id`) REFERENCES `sessions`(`id`),
  FOREIGN KEY (`span_id`) REFERENCES `spans`(`id`)
);
CREATE TABLE IF NOT EXISTS `errors` (
  `id` text PRIMARY KEY NOT NULL,
  `session_id` text NOT NULL,
  `span_id` text,
  `name` text NOT NULL,
  `message` text NOT NULL,
  `type` text,
  `stack` text,
  `attributes` text NOT NULL,
  `occurred_at` text NOT NULL,
  `created_at` text NOT NULL,
  FOREIGN KEY (`session_id`) REFERENCES `sessions`(`id`),
  FOREIGN KEY (`span_id`) REFERENCES `spans`(`id`)
);
CREATE TABLE IF NOT EXISTS `usage` (
  `id` text PRIMARY KEY NOT NULL,
  `session_id` text NOT NULL,
  `span_id` text,
  `input_tokens` integer,
  `output_tokens` integer,
  `total_tokens` integer,
  `estimated_cost_usd` real,
  `created_at` text NOT NULL,
  FOREIGN KEY (`session_id`) REFERENCES `sessions`(`id`),
  FOREIGN KEY (`span_id`) REFERENCES `spans`(`id`)
);
