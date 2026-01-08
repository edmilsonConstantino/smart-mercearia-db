import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, real, blob } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Helper para criar IDs únicos (substituindo UUID do PostgreSQL)
const generateId = () => crypto.randomUUID();

// USERS TABLE
export const users = sqliteTable("users", {
  id: text("id").primaryKey().$defaultFn(() => generateId()),
  name: text("name").notNull(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().$type<'admin' | 'manager' | 'seller'>(),
  avatar: text("avatar"),
  createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// CATEGORIES TABLE
export const categories = sqliteTable("categories", {
  id: text("id").primaryKey().$defaultFn(() => generateId()),
  name: text("name").notNull(),
  color: text("color").notNull(),
  createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
});

export const insertCategorySchema = createInsertSchema(categories).omit({ id: true, createdAt: true });
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;

// PRODUCTS TABLE
export const products = sqliteTable("products", {
  id: text("id").primaryKey().$defaultFn(() => generateId()),
  sku: text("sku").notNull().unique(),
  name: text("name").notNull(),
  categoryId: text("category_id").references(() => categories.id),
  price: text("price").notNull(), // SQLite armazena como TEXT
  costPrice: text("cost_price").default('0'),
  stock: text("stock").notNull().default('0'),
  minStock: text("min_stock").default('5'),
  unit: text("unit").notNull().$type<'un' | 'kg' | 'g' | 'pack' | 'box'>(),
  image: text("image"),
  createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
  updatedAt: integer("updated_at", { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
});

export const insertProductSchema = createInsertSchema(products).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

// SALES TABLE
export const sales = sqliteTable("sales", {
  id: text("id").primaryKey().$defaultFn(() => generateId()),
  userId: text("user_id").notNull().references(() => users.id),
  total: text("total").notNull(),
  amountReceived: text("amount_received"),
  change: text("change"),
  paymentMethod: text("payment_method").notNull().$type<'cash' | 'card' | 'pix' | 'mpesa' | 'emola' | 'pos' | 'bank'>(),
  items: text("items", { mode: 'json' }).notNull().$type<Array<{
    productId: string;
    quantity: number;
    priceAtSale: number;
  }>>(),
  preview: text("preview", { mode: 'json' }).$type<{
    items: Array<{ productId: string; quantity: number; priceAtSale: number; productName: string; productUnit: string }>;
    subtotal: number;
    discount: { type: 'none' | 'percentage' | 'fixed'; value: number };
    discountAmount: number;
    total: number;
    paymentMethod: string;
    amountReceived?: number;
    change?: number;
  }>(),
  createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
});

export const insertSaleSchema = createInsertSchema(sales).omit({ id: true, createdAt: true });
export type InsertSale = z.infer<typeof insertSaleSchema>;
export type Sale = typeof sales.$inferSelect;

// NOTIFICATIONS TABLE
export const notifications = sqliteTable("notifications", {
  id: text("id").primaryKey().$defaultFn(() => generateId()),
  userId: text("user_id").references(() => users.id),
  type: text("type").notNull().$type<'info' | 'warning' | 'success' | 'error'>(),
  message: text("message").notNull(),
  read: integer("read", { mode: 'boolean' }).default(false).notNull(),
  metadata: text("metadata", { mode: 'json' }),
  createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({ id: true, createdAt: true });
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;

// AUDIT LOG TABLE
export const auditLogs = sqliteTable("audit_logs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id").notNull().references(() => users.id),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id"),
  details: text("details", { mode: 'json' }),
  createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
});

export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({ id: true, createdAt: true });
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type AuditLog = typeof auditLogs.$inferSelect;

// DAILY EDIT TRACKER
export const dailyEdits = sqliteTable("daily_edits", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id").notNull().references(() => users.id),
  date: text("date").notNull(),
  editCount: integer("edit_count").default(0).notNull(),
});

export const insertDailyEditSchema = createInsertSchema(dailyEdits).omit({ id: true });
export type InsertDailyEdit = z.infer<typeof insertDailyEditSchema>;
export type DailyEdit = typeof dailyEdits.$inferSelect;

// TASKS TABLE
export const tasks = sqliteTable("tasks", {
  id: text("id").primaryKey().$defaultFn(() => generateId()),
  title: text("title").notNull(),
  completed: integer("completed", { mode: 'boolean' }).default(false).notNull(),
  assignedTo: text("assigned_to").notNull().$type<'all' | 'admin' | 'manager' | 'seller' | 'user'>(),
  assignedToId: text("assigned_to_id").references(() => users.id),
  createdBy: text("created_by").notNull().references(() => users.id),
  createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
});

export const insertTaskSchema = createInsertSchema(tasks).omit({ id: true, createdAt: true });
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;

// ORDERS TABLE
export const orders = sqliteTable("orders", {
  id: text("id").primaryKey().$defaultFn(() => generateId()),
  orderCode: text("order_code", { length: 8 }).notNull().unique(),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  items: text("items", { mode: 'json' }).notNull().$type<Array<{
    productId: string;
    quantity: number;
    priceAtSale: number;
  }>>(),
  total: text("total").notNull(),
  status: text("status").notNull().$type<'pending' | 'approved' | 'cancelled'>().default('pending'),
  paymentMethod: text("payment_method").notNull().$type<'cash' | 'transfer'>(),
  paymentProof: text("payment_proof"),
  approvedBy: text("approved_by").references(() => users.id),
  createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
  approvedAt: integer("approved_at", { mode: 'timestamp' }),
});

export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, orderCode: true, status: true, approvedBy: true, createdAt: true, approvedAt: true });
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;

// ORDER REOPENS TRACKING
export const orderReopens = sqliteTable("order_reopens", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  orderId: text("order_id").notNull().references(() => orders.id),
  userId: text("user_id").notNull().references(() => users.id),
  date: text("date").notNull(),
  createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
});

export const insertOrderReopenSchema = createInsertSchema(orderReopens).omit({ id: true, createdAt: true });
export type InsertOrderReopen = z.infer<typeof insertOrderReopenSchema>;
export type OrderReopen = typeof orderReopens.$inferSelect;