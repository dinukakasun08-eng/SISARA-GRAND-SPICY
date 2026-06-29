CREATE TABLE "orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_id" text NOT NULL,
	"customer_name" text NOT NULL,
	"customer_phone" text NOT NULL,
	"delivery_address" text NOT NULL,
	"coordinates" json,
	"items" json NOT NULL,
	"total_amount" integer NOT NULL,
	"status" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"price" integer NOT NULL,
	"category" text NOT NULL,
	"image_url" text,
	"is_popular" boolean DEFAULT false,
	"is_spicy" boolean DEFAULT false,
	"is_vegetarian" boolean DEFAULT false,
	"is_vegan" boolean DEFAULT false,
	"is_gluten_free" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"user_name" text NOT NULL,
	"rating" integer NOT NULL,
	"comment" text NOT NULL,
	"is_pinned" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"id" text PRIMARY KEY NOT NULL,
	"delivery_fee" integer NOT NULL,
	"delivery_radius" integer NOT NULL,
	"store_location" json NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"uid" text NOT NULL,
	"email" text NOT NULL,
	CONSTRAINT "users_uid_unique" UNIQUE("uid")
);
