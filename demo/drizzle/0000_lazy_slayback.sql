CREATE TABLE `sandbox_receipts` (
	`key` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`run_id` text NOT NULL,
	`job_id` text NOT NULL,
	`payload_hash` text NOT NULL,
	`receipt` text NOT NULL,
	`created_at` integer NOT NULL
);
