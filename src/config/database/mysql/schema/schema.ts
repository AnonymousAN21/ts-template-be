import {serial, varchar, timestamp, mysqlTable } from "drizzle-orm/mysql-core"; 

// Dummy Schema Delete if needed!
export const users = mysqlTable('users', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull()
})