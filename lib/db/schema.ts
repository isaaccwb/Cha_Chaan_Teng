/**
 * Drizzle schema — 對應 docs/PROJECT_PLAN.md 〈二、技術架構 §3〉全部 9 張表 + enum。
 *
 * 核心原則:every business table 都有 restaurantId FK,V1 得一行 restaurants,
 * 但呢個設計令 V2 多租戶擴展唔使 migration(見 §7 Scalability Path)。
 */

import {
  pgTable,
  uuid,
  text,
  numeric,
  boolean,
  integer,
  timestamp,
  pgEnum,
  serial,
  unique,
  index,
} from "drizzle-orm/pg-core";

// ========== Enums ==========

export const staffRoleEnum = pgEnum("staff_role", ["admin", "staff"]);

export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "confirmed",
  "preparing",
  "ready",
  "completed",
  "cancelled",
]);

export const paymentStatusEnum = pgEnum("payment_status", ["unpaid", "mock_paid"]);

export const paymentMethodEnum = pgEnum("payment_method", [
  "cash",
  "octopus_mock",
  "fps_mock",
]);

export const optionGroupEnum = pgEnum("option_group", [
  "走料",
  "加料",
  "套餐飲品",
  "其他",
]);

// ========== 1. restaurants(V1 得一行,但一定要有) ==========

export const restaurants = pgTable("restaurants", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  domain: text("domain").unique(),
  phone: text("phone"),
  address: text("address"),
  timezone: text("timezone").notNull().default("Asia/Hong_Kong"),
  currency: text("currency").notNull().default("HKD"),
  serviceChargeEnabled: boolean("service_charge_enabled").notNull().default(false),
  serviceChargePercent: numeric("service_charge_percent", { precision: 4, scale: 2 })
    .notNull()
    .default("0"),
  minSpendAmount: numeric("min_spend_amount", { precision: 10, scale: 2 }),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ========== 2. staff_users ==========

export const staffUsers = pgTable(
  "staff_users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    restaurantId: uuid("restaurant_id")
      .notNull()
      .references(() => restaurants.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    displayName: text("display_name").notNull(),
    role: staffRoleEnum("role").notNull().default("staff"),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [unique().on(table.restaurantId, table.email)]
);

// ========== 3. menu_categories ==========

export const menuCategories = pgTable("menu_categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  restaurantId: uuid("restaurant_id")
    .notNull()
    .references(() => restaurants.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ========== 4. menu_items ==========

export const menuItems = pgTable(
  "menu_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    restaurantId: uuid("restaurant_id")
      .notNull()
      .references(() => restaurants.id, { onDelete: "cascade" }),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => menuCategories.id, { onDelete: "cascade" }),
    code: text("code"), // 'A' / 'B' / 'C'... 保留 V0 嘅餐牌代號
    name: text("name").notNull(),
    description: text("description"),
    price: numeric("price", { precision: 10, scale: 2 }).notNull(),
    imageUrl: text("image_url"),
    imagePrompt: text("image_prompt"), // 生成呢張相用嘅完整 prompt,方便日後追溯/重生
    isAvailable: boolean("is_available").notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("idx_menu_items_restaurant").on(table.restaurantId)]
);

// ========== 5. item_options(走青/走冰/跟套餐呢類 add-on) ==========

export const itemOptions = pgTable(
  "item_options",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    restaurantId: uuid("restaurant_id")
      .notNull()
      .references(() => restaurants.id, { onDelete: "cascade" }),
    menuItemId: uuid("menu_item_id")
      .notNull()
      .references(() => menuItems.id, { onDelete: "cascade" }),
    groupName: optionGroupEnum("group_name").notNull().default("其他"),
    name: text("name").notNull(), // '走青', '凍飲', '跟套餐(+$10)'
    priceDelta: numeric("price_delta", { precision: 10, scale: 2 }).notNull().default("0"),
    isDefault: boolean("is_default").notNull().default(false),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (table) => [index("idx_item_options_item").on(table.menuItemId)]
);

// ========== 6. orders ==========

export const orders = pgTable(
  "orders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    restaurantId: uuid("restaurant_id")
      .notNull()
      .references(() => restaurants.id, { onDelete: "cascade" }),
    orderNumber: serial("order_number"),
    tableNumber: text("table_number"),
    guestToken: text("guest_token").notNull(),
    status: orderStatusEnum("status").notNull().default("pending"),
    paymentStatus: paymentStatusEnum("payment_status").notNull().default("unpaid"),
    paymentMethod: paymentMethodEnum("payment_method"),
    subtotal: numeric("subtotal", { precision: 10, scale: 2 }).notNull(),
    total: numeric("total", { precision: 10, scale: 2 }).notNull(),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("idx_orders_restaurant_status").on(table.restaurantId, table.status),
    index("idx_orders_guest_token").on(table.guestToken),
  ]
);

// ========== 7. order_items ==========

export const orderItems = pgTable(
  "order_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    menuItemId: uuid("menu_item_id")
      .notNull()
      .references(() => menuItems.id),
    itemNameSnapshot: text("item_name_snapshot").notNull(),
    unitPriceSnapshot: numeric("unit_price_snapshot", { precision: 10, scale: 2 }).notNull(),
    quantity: integer("quantity").notNull().default(1),
    lineTotal: numeric("line_total", { precision: 10, scale: 2 }).notNull(),
    notes: text("notes"),
  },
  (table) => [index("idx_order_items_order").on(table.orderId)]
);

// ========== 8. order_item_options ==========

export const orderItemOptions = pgTable("order_item_options", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderItemId: uuid("order_item_id")
    .notNull()
    .references(() => orderItems.id, { onDelete: "cascade" }),
  itemOptionId: uuid("item_option_id")
    .notNull()
    .references(() => itemOptions.id),
  nameSnapshot: text("name_snapshot").notNull(),
  priceDeltaSnapshot: numeric("price_delta_snapshot", { precision: 10, scale: 2 }).notNull(),
});

// ========== 9. order_status_history ==========

export const orderStatusHistory = pgTable(
  "order_status_history",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    fromStatus: orderStatusEnum("from_status"),
    toStatus: orderStatusEnum("to_status").notNull(),
    changedBy: uuid("changed_by").references(() => staffUsers.id),
    note: text("note"),
    changedAt: timestamp("changed_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("idx_order_status_history_order").on(table.orderId)]
);

// ========== 狀態機:合法轉移(對應 §6.1) ==========
// lib/actions/staff-orders.ts 嘅 updateOrderStatus 要用呢個 map 做合法性檢查,
// 唔畀前端亂咁轉任意狀態。放喺 schema.ts 方便 db 層同 action 層共用同一個定義。

export const ORDER_STATUS_TRANSITIONS: Record<
  (typeof orderStatusEnum.enumValues)[number],
  (typeof orderStatusEnum.enumValues)[number][]
> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["preparing", "cancelled"],
  preparing: ["ready"],
  ready: ["completed"],
  completed: [],
  cancelled: [],
};

export type Restaurant = typeof restaurants.$inferSelect;
export type StaffUser = typeof staffUsers.$inferSelect;
export type MenuCategory = typeof menuCategories.$inferSelect;
export type MenuItem = typeof menuItems.$inferSelect;
export type ItemOption = typeof itemOptions.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type OrderItemOption = typeof orderItemOptions.$inferSelect;
export type OrderStatusHistoryRow = typeof orderStatusHistory.$inferSelect;
