CREATE TYPE "public"."option_group" AS ENUM('走料', '加料', '套餐飲品', '其他');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."payment_method" AS ENUM('cash', 'octopus_mock', 'fps_mock');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('unpaid', 'mock_paid');--> statement-breakpoint
CREATE TYPE "public"."staff_role" AS ENUM('admin', 'staff');--> statement-breakpoint
CREATE TABLE "item_options" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"restaurant_id" uuid NOT NULL,
	"menu_item_id" uuid NOT NULL,
	"group_name" "option_group" DEFAULT '其他' NOT NULL,
	"name" text NOT NULL,
	"price_delta" numeric(10, 2) DEFAULT '0' NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "menu_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"restaurant_id" uuid NOT NULL,
	"name" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "menu_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"restaurant_id" uuid NOT NULL,
	"category_id" uuid NOT NULL,
	"code" text,
	"name" text NOT NULL,
	"description" text,
	"price" numeric(10, 2) NOT NULL,
	"image_url" text,
	"image_prompt" text,
	"is_available" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_item_options" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_item_id" uuid NOT NULL,
	"item_option_id" uuid NOT NULL,
	"name_snapshot" text NOT NULL,
	"price_delta_snapshot" numeric(10, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"menu_item_id" uuid NOT NULL,
	"item_name_snapshot" text NOT NULL,
	"unit_price_snapshot" numeric(10, 2) NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"line_total" numeric(10, 2) NOT NULL,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "order_status_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"from_status" "order_status",
	"to_status" "order_status" NOT NULL,
	"changed_by" uuid,
	"note" text,
	"changed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"restaurant_id" uuid NOT NULL,
	"order_number" serial NOT NULL,
	"table_number" text,
	"guest_token" text NOT NULL,
	"status" "order_status" DEFAULT 'pending' NOT NULL,
	"payment_status" "payment_status" DEFAULT 'unpaid' NOT NULL,
	"payment_method" "payment_method",
	"subtotal" numeric(10, 2) NOT NULL,
	"total" numeric(10, 2) NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "restaurants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"domain" text,
	"phone" text,
	"address" text,
	"timezone" text DEFAULT 'Asia/Hong_Kong' NOT NULL,
	"currency" text DEFAULT 'HKD' NOT NULL,
	"service_charge_enabled" boolean DEFAULT false NOT NULL,
	"service_charge_percent" numeric(4, 2) DEFAULT '0' NOT NULL,
	"min_spend_amount" numeric(10, 2),
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "restaurants_slug_unique" UNIQUE("slug"),
	CONSTRAINT "restaurants_domain_unique" UNIQUE("domain")
);
--> statement-breakpoint
CREATE TABLE "staff_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"restaurant_id" uuid NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"display_name" text NOT NULL,
	"role" "staff_role" DEFAULT 'staff' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "staff_users_restaurant_id_email_unique" UNIQUE("restaurant_id","email")
);
--> statement-breakpoint
ALTER TABLE "item_options" ADD CONSTRAINT "item_options_restaurant_id_restaurants_id_fk" FOREIGN KEY ("restaurant_id") REFERENCES "public"."restaurants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "item_options" ADD CONSTRAINT "item_options_menu_item_id_menu_items_id_fk" FOREIGN KEY ("menu_item_id") REFERENCES "public"."menu_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "menu_categories" ADD CONSTRAINT "menu_categories_restaurant_id_restaurants_id_fk" FOREIGN KEY ("restaurant_id") REFERENCES "public"."restaurants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_restaurant_id_restaurants_id_fk" FOREIGN KEY ("restaurant_id") REFERENCES "public"."restaurants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_category_id_menu_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."menu_categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_item_options" ADD CONSTRAINT "order_item_options_order_item_id_order_items_id_fk" FOREIGN KEY ("order_item_id") REFERENCES "public"."order_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_item_options" ADD CONSTRAINT "order_item_options_item_option_id_item_options_id_fk" FOREIGN KEY ("item_option_id") REFERENCES "public"."item_options"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_menu_item_id_menu_items_id_fk" FOREIGN KEY ("menu_item_id") REFERENCES "public"."menu_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_status_history" ADD CONSTRAINT "order_status_history_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_status_history" ADD CONSTRAINT "order_status_history_changed_by_staff_users_id_fk" FOREIGN KEY ("changed_by") REFERENCES "public"."staff_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_restaurant_id_restaurants_id_fk" FOREIGN KEY ("restaurant_id") REFERENCES "public"."restaurants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staff_users" ADD CONSTRAINT "staff_users_restaurant_id_restaurants_id_fk" FOREIGN KEY ("restaurant_id") REFERENCES "public"."restaurants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_item_options_item" ON "item_options" USING btree ("menu_item_id");--> statement-breakpoint
CREATE INDEX "idx_menu_items_restaurant" ON "menu_items" USING btree ("restaurant_id");--> statement-breakpoint
CREATE INDEX "idx_order_items_order" ON "order_items" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "idx_order_status_history_order" ON "order_status_history" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "idx_orders_restaurant_status" ON "orders" USING btree ("restaurant_id","status");--> statement-breakpoint
CREATE INDEX "idx_orders_guest_token" ON "orders" USING btree ("guest_token");