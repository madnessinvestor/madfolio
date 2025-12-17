import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, real, timestamp, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const assets = pgTable("assets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  symbol: text("symbol").notNull(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  market: text("market").notNull(),
});

export const insertAssetSchema = createInsertSchema(assets).omit({ id: true });
export type InsertAsset = z.infer<typeof insertAssetSchema>;
export type Asset = typeof assets.$inferSelect;

export const snapshots = pgTable("snapshots", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  assetId: varchar("asset_id").notNull().references(() => assets.id, { onDelete: "cascade" }),
  value: real("value").notNull(),
  amount: real("amount"),
  unitPrice: real("unit_price"),
  date: date("date").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSnapshotSchema = createInsertSchema(snapshots).omit({ id: true, createdAt: true });
export type InsertSnapshot = z.infer<typeof insertSnapshotSchema>;
export type Snapshot = typeof snapshots.$inferSelect;

export const monthlyStatements = pgTable("monthly_statements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  month: integer("month").notNull(),
  year: integer("year").notNull(),
  startValue: real("start_value").notNull().default(0),
  endValue: real("end_value").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertMonthlyStatementSchema = createInsertSchema(monthlyStatements).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertMonthlyStatement = z.infer<typeof insertMonthlyStatementSchema>;
export type MonthlyStatement = typeof monthlyStatements.$inferSelect;
