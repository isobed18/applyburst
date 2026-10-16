import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
export const receipts = sqliteTable('sandbox_receipts', {
  key: text('key').primaryKey(),
  owner: text('owner').notNull(),
  runId: text('run_id').notNull(),
  jobId: text('job_id').notNull(),
  payloadHash: text('payload_hash').notNull(),
  receipt: text('receipt').notNull(),
  createdAt: integer('created_at').notNull(),
});
