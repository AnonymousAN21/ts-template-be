import { sql } from 'drizzle-orm/sql';
import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';

// Dummy Schema Delete if needed!
export const users = sqliteTable('users', {
    id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
});