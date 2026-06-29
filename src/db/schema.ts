import { pgTable, serial, text, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  price: integer("price").notNull(),
  category: text("category").notNull(),
  imageUrl: text("image_url"),
  isPopular: boolean("is_popular").default(false),
  isSpicy: boolean("is_spicy").default(false),
  isVegetarian: boolean("is_vegetarian").default(false),
  isVegan: boolean("is_vegan").default(false),
  isGlutenFree: boolean("is_gluten_free").default(false),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  customerId: text("customer_id").notNull(),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  deliveryAddress: text("delivery_address").notNull(),
  coordinates: json("coordinates"),
  items: json("items").notNull(), // Array of items
  totalAmount: integer("total_amount").notNull(),
  status: text("status").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  userName: text("user_name").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment").notNull(),
  isPinned: boolean("is_pinned").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const settings = pgTable("settings", {
  id: text("id").primaryKey(), // e.g., 'store'
  deliveryFee: integer("delivery_fee").notNull(),
  deliveryRadius: integer("delivery_radius").notNull(),
  storeLocation: json("store_location").notNull(),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  uid: text("uid").unique().notNull(), // Firebase Auth UID
  email: text("email").notNull(),
});
