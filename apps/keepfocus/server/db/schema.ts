// Keepfocus model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { sql } from "drizzle-orm";
import {
  index,
  pgTableCreator,
  varchar,
  text,
  timestamp,
  serial,
} from "drizzle-orm/pg-core";

/**
 * This is an keepfocus of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `keepfocus_${name}`);

// Keepfocus items table - simple CRUD keepfocus
export const items = createTable(
  "items",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 256 }).notNull(),
    description: text("description"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    index("idx_items_name").on(table.name),
    index("idx_items_created_at").on(table.createdAt),
  ]
);

// Type exports for use in tRPC and other parts of the application
export type Item = typeof items.$inferSelect;
export type NewItem = typeof items.$inferInsert;
