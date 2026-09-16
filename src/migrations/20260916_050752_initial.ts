import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`users_sessions\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`created_at\` text,
  	\`expires_at\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`users_sessions_order_idx\` ON \`users_sessions\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`users_sessions_parent_id_idx\` ON \`users_sessions\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`users\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`role\` text DEFAULT 'editor' NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`email\` text NOT NULL,
  	\`reset_password_token\` text,
  	\`reset_password_expiration\` text,
  	\`salt\` text,
  	\`hash\` text,
  	\`login_attempts\` numeric DEFAULT 0,
  	\`lock_until\` text
  );
  `)
  await db.run(sql`CREATE INDEX \`users_updated_at_idx\` ON \`users\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`users_created_at_idx\` ON \`users\` (\`created_at\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`users_email_idx\` ON \`users\` (\`email\`);`)
  await db.run(sql`CREATE TABLE \`media\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`credit\` text NOT NULL,
  	\`usage_rights\` text DEFAULT 'own' NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`url\` text,
  	\`thumbnail_u_r_l\` text,
  	\`filename\` text,
  	\`mime_type\` text,
  	\`filesize\` numeric,
  	\`width\` numeric,
  	\`height\` numeric,
  	\`focal_x\` numeric,
  	\`focal_y\` numeric,
  	\`sizes_thumb_url\` text,
  	\`sizes_thumb_width\` numeric,
  	\`sizes_thumb_height\` numeric,
  	\`sizes_thumb_mime_type\` text,
  	\`sizes_thumb_filesize\` numeric,
  	\`sizes_thumb_filename\` text,
  	\`sizes_card_url\` text,
  	\`sizes_card_width\` numeric,
  	\`sizes_card_height\` numeric,
  	\`sizes_card_mime_type\` text,
  	\`sizes_card_filesize\` numeric,
  	\`sizes_card_filename\` text,
  	\`sizes_wide_url\` text,
  	\`sizes_wide_width\` numeric,
  	\`sizes_wide_height\` numeric,
  	\`sizes_wide_mime_type\` text,
  	\`sizes_wide_filesize\` numeric,
  	\`sizes_wide_filename\` text
  );
  `)
  await db.run(sql`CREATE INDEX \`media_updated_at_idx\` ON \`media\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`media_created_at_idx\` ON \`media\` (\`created_at\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`media_filename_idx\` ON \`media\` (\`filename\`);`)
  await db.run(sql`CREATE INDEX \`media_sizes_thumb_sizes_thumb_filename_idx\` ON \`media\` (\`sizes_thumb_filename\`);`)
  await db.run(sql`CREATE INDEX \`media_sizes_card_sizes_card_filename_idx\` ON \`media\` (\`sizes_card_filename\`);`)
  await db.run(sql`CREATE INDEX \`media_sizes_wide_sizes_wide_filename_idx\` ON \`media\` (\`sizes_wide_filename\`);`)
  await db.run(sql`CREATE TABLE \`media_locales\` (
  	\`alt\` text NOT NULL,
  	\`caption\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`media_locales_locale_parent_id_unique\` ON \`media_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`categories\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`slug\` text,
  	\`type\` text NOT NULL,
  	\`order\` numeric DEFAULT 0,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`categories_slug_idx\` ON \`categories\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`categories_updated_at_idx\` ON \`categories\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`categories_created_at_idx\` ON \`categories\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`categories_locales\` (
  	\`title\` text NOT NULL,
  	\`description\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`categories\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`categories_locales_locale_parent_id_unique\` ON \`categories_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`artisans\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`slug\` text,
  	\`photo_id\` integer,
  	\`consent_bio\` integer DEFAULT false NOT NULL,
  	\`consent_photo\` integer,
  	\`consent_date\` text,
  	\`order\` numeric DEFAULT 0,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`photo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`artisans_slug_idx\` ON \`artisans\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`artisans_photo_idx\` ON \`artisans\` (\`photo_id\`);`)
  await db.run(sql`CREATE INDEX \`artisans_updated_at_idx\` ON \`artisans\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`artisans_created_at_idx\` ON \`artisans\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`artisans_locales\` (
  	\`name\` text NOT NULL,
  	\`title\` text NOT NULL,
  	\`specialty\` text,
  	\`bio\` text,
  	\`source\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`artisans\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`artisans_locales_locale_parent_id_unique\` ON \`artisans_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`products_gallery\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`products\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`products_gallery_order_idx\` ON \`products_gallery\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`products_gallery_parent_id_idx\` ON \`products_gallery\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`products_gallery_image_idx\` ON \`products_gallery\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`products_story\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`value\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`products\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`products_story_order_idx\` ON \`products_story\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`products_story_parent_id_idx\` ON \`products_story\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`products_story_locale_idx\` ON \`products_story\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`products_badges\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`value\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`products\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`products_badges_order_idx\` ON \`products_badges\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`products_badges_parent_id_idx\` ON \`products_badges\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`products_badges_locale_idx\` ON \`products_badges\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`products_main_herbs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`value\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`products\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`products_main_herbs_order_idx\` ON \`products_main_herbs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`products_main_herbs_parent_id_idx\` ON \`products_main_herbs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`products_main_herbs_locale_idx\` ON \`products_main_herbs\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`products_usage\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`value\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`products\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`products_usage_order_idx\` ON \`products_usage\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`products_usage_parent_id_idx\` ON \`products_usage\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`products_usage_locale_idx\` ON \`products_usage\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`products_care_instructions\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`value\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`products\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`products_care_instructions_order_idx\` ON \`products_care_instructions\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`products_care_instructions_parent_id_idx\` ON \`products_care_instructions\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`products_care_instructions_locale_idx\` ON \`products_care_instructions\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`products\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`category_id\` integer,
  	\`artisan_id\` integer,
  	\`price\` numeric,
  	\`availability\` text DEFAULT 'in-stock',
  	\`featured\` integer,
  	\`order\` numeric DEFAULT 0,
  	\`form\` text,
  	\`external_use_only\` integer DEFAULT true,
  	\`registration_type\` text DEFAULT 'none',
  	\`registration_no\` text,
  	\`slug\` text,
  	\`sku\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`_status\` text DEFAULT 'draft',
  	FOREIGN KEY (\`category_id\`) REFERENCES \`categories\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`artisan_id\`) REFERENCES \`artisans\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`products_category_idx\` ON \`products\` (\`category_id\`);`)
  await db.run(sql`CREATE INDEX \`products_artisan_idx\` ON \`products\` (\`artisan_id\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`products_slug_idx\` ON \`products\` (\`slug\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`products_sku_idx\` ON \`products\` (\`sku\`);`)
  await db.run(sql`CREATE INDEX \`products_updated_at_idx\` ON \`products\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`products_created_at_idx\` ON \`products\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`products__status_idx\` ON \`products\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`products_locales\` (
  	\`name\` text,
  	\`excerpt\` text,
  	\`lead_time\` text,
  	\`net_content\` text,
  	\`shelf_life\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`products\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`products_locales_locale_parent_id_unique\` ON \`products_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_products_v_version_gallery\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	\`_uuid\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_products_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_products_v_version_gallery_order_idx\` ON \`_products_v_version_gallery\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_version_gallery_parent_id_idx\` ON \`_products_v_version_gallery\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_version_gallery_image_idx\` ON \`_products_v_version_gallery\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`_products_v_version_story\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`value\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_products_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_products_v_version_story_order_idx\` ON \`_products_v_version_story\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_version_story_parent_id_idx\` ON \`_products_v_version_story\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_version_story_locale_idx\` ON \`_products_v_version_story\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_products_v_version_badges\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`value\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_products_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_products_v_version_badges_order_idx\` ON \`_products_v_version_badges\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_version_badges_parent_id_idx\` ON \`_products_v_version_badges\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_version_badges_locale_idx\` ON \`_products_v_version_badges\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_products_v_version_main_herbs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`value\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_products_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_products_v_version_main_herbs_order_idx\` ON \`_products_v_version_main_herbs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_version_main_herbs_parent_id_idx\` ON \`_products_v_version_main_herbs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_version_main_herbs_locale_idx\` ON \`_products_v_version_main_herbs\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_products_v_version_usage\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`value\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_products_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_products_v_version_usage_order_idx\` ON \`_products_v_version_usage\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_version_usage_parent_id_idx\` ON \`_products_v_version_usage\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_version_usage_locale_idx\` ON \`_products_v_version_usage\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_products_v_version_care_instructions\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`value\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_products_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_products_v_version_care_instructions_order_idx\` ON \`_products_v_version_care_instructions\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_version_care_instructions_parent_id_idx\` ON \`_products_v_version_care_instructions\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_version_care_instructions_locale_idx\` ON \`_products_v_version_care_instructions\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_products_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`parent_id\` integer,
  	\`version_category_id\` integer,
  	\`version_artisan_id\` integer,
  	\`version_price\` numeric,
  	\`version_availability\` text DEFAULT 'in-stock',
  	\`version_featured\` integer,
  	\`version_order\` numeric DEFAULT 0,
  	\`version_form\` text,
  	\`version_external_use_only\` integer DEFAULT true,
  	\`version_registration_type\` text DEFAULT 'none',
  	\`version_registration_no\` text,
  	\`version_slug\` text,
  	\`version_sku\` text,
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`version__status\` text DEFAULT 'draft',
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`snapshot\` integer,
  	\`published_locale\` text,
  	\`latest\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`products\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_category_id\`) REFERENCES \`categories\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_artisan_id\`) REFERENCES \`artisans\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`_products_v_parent_idx\` ON \`_products_v\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_version_version_category_idx\` ON \`_products_v\` (\`version_category_id\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_version_version_artisan_idx\` ON \`_products_v\` (\`version_artisan_id\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_version_version_slug_idx\` ON \`_products_v\` (\`version_slug\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_version_version_sku_idx\` ON \`_products_v\` (\`version_sku\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_version_version_updated_at_idx\` ON \`_products_v\` (\`version_updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_version_version_created_at_idx\` ON \`_products_v\` (\`version_created_at\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_version_version__status_idx\` ON \`_products_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_created_at_idx\` ON \`_products_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_updated_at_idx\` ON \`_products_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_snapshot_idx\` ON \`_products_v\` (\`snapshot\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_published_locale_idx\` ON \`_products_v\` (\`published_locale\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_latest_idx\` ON \`_products_v\` (\`latest\`);`)
  await db.run(sql`CREATE TABLE \`_products_v_locales\` (
  	\`version_name\` text,
  	\`version_excerpt\` text,
  	\`version_lead_time\` text,
  	\`version_net_content\` text,
  	\`version_shelf_life\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_products_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_products_v_locales_locale_parent_id_unique\` ON \`_products_v_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`articles_blocks_heading\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`level\` text DEFAULT '2',
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`articles\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`articles_blocks_heading_order_idx\` ON \`articles_blocks_heading\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`articles_blocks_heading_parent_id_idx\` ON \`articles_blocks_heading\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`articles_blocks_heading_path_idx\` ON \`articles_blocks_heading\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`articles_blocks_heading_locales\` (
  	\`text\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`articles_blocks_heading\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`articles_blocks_heading_locales_locale_parent_id_unique\` ON \`articles_blocks_heading_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`articles_blocks_paragraph\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`articles\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`articles_blocks_paragraph_order_idx\` ON \`articles_blocks_paragraph\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`articles_blocks_paragraph_parent_id_idx\` ON \`articles_blocks_paragraph\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`articles_blocks_paragraph_path_idx\` ON \`articles_blocks_paragraph\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`articles_blocks_paragraph_locales\` (
  	\`text\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`articles_blocks_paragraph\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`articles_blocks_paragraph_locales_locale_parent_id_unique\` ON \`articles_blocks_paragraph_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`articles_blocks_list_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`value\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`articles_blocks_list\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`articles_blocks_list_items_order_idx\` ON \`articles_blocks_list_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`articles_blocks_list_items_parent_id_idx\` ON \`articles_blocks_list_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`articles_blocks_list_items_locale_idx\` ON \`articles_blocks_list_items\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`articles_blocks_list\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`style\` text DEFAULT 'bullet',
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`articles\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`articles_blocks_list_order_idx\` ON \`articles_blocks_list\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`articles_blocks_list_parent_id_idx\` ON \`articles_blocks_list\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`articles_blocks_list_path_idx\` ON \`articles_blocks_list\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`articles_blocks_image\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`media_id\` integer,
  	\`block_name\` text,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`articles\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`articles_blocks_image_order_idx\` ON \`articles_blocks_image\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`articles_blocks_image_parent_id_idx\` ON \`articles_blocks_image\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`articles_blocks_image_path_idx\` ON \`articles_blocks_image\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`articles_blocks_image_media_idx\` ON \`articles_blocks_image\` (\`media_id\`);`)
  await db.run(sql`CREATE TABLE \`articles_blocks_quote\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`articles\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`articles_blocks_quote_order_idx\` ON \`articles_blocks_quote\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`articles_blocks_quote_parent_id_idx\` ON \`articles_blocks_quote\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`articles_blocks_quote_path_idx\` ON \`articles_blocks_quote\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`articles_blocks_quote_locales\` (
  	\`text\` text,
  	\`attribution\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`articles_blocks_quote\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`articles_blocks_quote_locales_locale_parent_id_unique\` ON \`articles_blocks_quote_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`articles_blocks_youtube\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`video_id\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`articles\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`articles_blocks_youtube_order_idx\` ON \`articles_blocks_youtube\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`articles_blocks_youtube_parent_id_idx\` ON \`articles_blocks_youtube\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`articles_blocks_youtube_path_idx\` ON \`articles_blocks_youtube\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`articles_blocks_youtube_locales\` (
  	\`title\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`articles_blocks_youtube\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`articles_blocks_youtube_locales_locale_parent_id_unique\` ON \`articles_blocks_youtube_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`articles\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`cover_image_id\` integer,
  	\`category_id\` integer,
  	\`artisan_id\` integer,
  	\`slug\` text,
  	\`published_at\` text,
  	\`featured\` integer,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`_status\` text DEFAULT 'draft',
  	FOREIGN KEY (\`cover_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`category_id\`) REFERENCES \`categories\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`artisan_id\`) REFERENCES \`artisans\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`articles_cover_image_idx\` ON \`articles\` (\`cover_image_id\`);`)
  await db.run(sql`CREATE INDEX \`articles_category_idx\` ON \`articles\` (\`category_id\`);`)
  await db.run(sql`CREATE INDEX \`articles_artisan_idx\` ON \`articles\` (\`artisan_id\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`articles_slug_idx\` ON \`articles\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`articles_updated_at_idx\` ON \`articles\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`articles_created_at_idx\` ON \`articles\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`articles__status_idx\` ON \`articles\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`articles_locales\` (
  	\`title\` text,
  	\`excerpt\` text,
  	\`author\` text DEFAULT 'กองบรรณาธิการชุมชนบ้านต้นโพธิ์',
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`articles\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`articles_locales_locale_parent_id_unique\` ON \`articles_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_articles_v_blocks_heading\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`level\` text DEFAULT '2',
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_articles_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_articles_v_blocks_heading_order_idx\` ON \`_articles_v_blocks_heading\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_articles_v_blocks_heading_parent_id_idx\` ON \`_articles_v_blocks_heading\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_articles_v_blocks_heading_path_idx\` ON \`_articles_v_blocks_heading\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_articles_v_blocks_heading_locales\` (
  	\`text\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_articles_v_blocks_heading\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_articles_v_blocks_heading_locales_locale_parent_id_unique\` ON \`_articles_v_blocks_heading_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_articles_v_blocks_paragraph\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_articles_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_articles_v_blocks_paragraph_order_idx\` ON \`_articles_v_blocks_paragraph\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_articles_v_blocks_paragraph_parent_id_idx\` ON \`_articles_v_blocks_paragraph\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_articles_v_blocks_paragraph_path_idx\` ON \`_articles_v_blocks_paragraph\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_articles_v_blocks_paragraph_locales\` (
  	\`text\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_articles_v_blocks_paragraph\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_articles_v_blocks_paragraph_locales_locale_parent_id_unique\` ON \`_articles_v_blocks_paragraph_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_articles_v_blocks_list_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`value\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_articles_v_blocks_list\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_articles_v_blocks_list_items_order_idx\` ON \`_articles_v_blocks_list_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_articles_v_blocks_list_items_parent_id_idx\` ON \`_articles_v_blocks_list_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_articles_v_blocks_list_items_locale_idx\` ON \`_articles_v_blocks_list_items\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_articles_v_blocks_list\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`style\` text DEFAULT 'bullet',
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_articles_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_articles_v_blocks_list_order_idx\` ON \`_articles_v_blocks_list\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_articles_v_blocks_list_parent_id_idx\` ON \`_articles_v_blocks_list\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_articles_v_blocks_list_path_idx\` ON \`_articles_v_blocks_list\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_articles_v_blocks_image\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`media_id\` integer,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_articles_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_articles_v_blocks_image_order_idx\` ON \`_articles_v_blocks_image\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_articles_v_blocks_image_parent_id_idx\` ON \`_articles_v_blocks_image\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_articles_v_blocks_image_path_idx\` ON \`_articles_v_blocks_image\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_articles_v_blocks_image_media_idx\` ON \`_articles_v_blocks_image\` (\`media_id\`);`)
  await db.run(sql`CREATE TABLE \`_articles_v_blocks_quote\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_articles_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_articles_v_blocks_quote_order_idx\` ON \`_articles_v_blocks_quote\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_articles_v_blocks_quote_parent_id_idx\` ON \`_articles_v_blocks_quote\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_articles_v_blocks_quote_path_idx\` ON \`_articles_v_blocks_quote\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_articles_v_blocks_quote_locales\` (
  	\`text\` text,
  	\`attribution\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_articles_v_blocks_quote\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_articles_v_blocks_quote_locales_locale_parent_id_unique\` ON \`_articles_v_blocks_quote_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_articles_v_blocks_youtube\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`video_id\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_articles_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_articles_v_blocks_youtube_order_idx\` ON \`_articles_v_blocks_youtube\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_articles_v_blocks_youtube_parent_id_idx\` ON \`_articles_v_blocks_youtube\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_articles_v_blocks_youtube_path_idx\` ON \`_articles_v_blocks_youtube\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_articles_v_blocks_youtube_locales\` (
  	\`title\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_articles_v_blocks_youtube\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_articles_v_blocks_youtube_locales_locale_parent_id_unique\` ON \`_articles_v_blocks_youtube_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_articles_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`parent_id\` integer,
  	\`version_cover_image_id\` integer,
  	\`version_category_id\` integer,
  	\`version_artisan_id\` integer,
  	\`version_slug\` text,
  	\`version_published_at\` text,
  	\`version_featured\` integer,
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`version__status\` text DEFAULT 'draft',
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`snapshot\` integer,
  	\`published_locale\` text,
  	\`latest\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`articles\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_cover_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_category_id\`) REFERENCES \`categories\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_artisan_id\`) REFERENCES \`artisans\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`_articles_v_parent_idx\` ON \`_articles_v\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_articles_v_version_version_cover_image_idx\` ON \`_articles_v\` (\`version_cover_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_articles_v_version_version_category_idx\` ON \`_articles_v\` (\`version_category_id\`);`)
  await db.run(sql`CREATE INDEX \`_articles_v_version_version_artisan_idx\` ON \`_articles_v\` (\`version_artisan_id\`);`)
  await db.run(sql`CREATE INDEX \`_articles_v_version_version_slug_idx\` ON \`_articles_v\` (\`version_slug\`);`)
  await db.run(sql`CREATE INDEX \`_articles_v_version_version_updated_at_idx\` ON \`_articles_v\` (\`version_updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_articles_v_version_version_created_at_idx\` ON \`_articles_v\` (\`version_created_at\`);`)
  await db.run(sql`CREATE INDEX \`_articles_v_version_version__status_idx\` ON \`_articles_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_articles_v_created_at_idx\` ON \`_articles_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_articles_v_updated_at_idx\` ON \`_articles_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_articles_v_snapshot_idx\` ON \`_articles_v\` (\`snapshot\`);`)
  await db.run(sql`CREATE INDEX \`_articles_v_published_locale_idx\` ON \`_articles_v\` (\`published_locale\`);`)
  await db.run(sql`CREATE INDEX \`_articles_v_latest_idx\` ON \`_articles_v\` (\`latest\`);`)
  await db.run(sql`CREATE TABLE \`_articles_v_locales\` (
  	\`version_title\` text,
  	\`version_excerpt\` text,
  	\`version_author\` text DEFAULT 'กองบรรณาธิการชุมชนบ้านต้นโพธิ์',
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_articles_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_articles_v_locales_locale_parent_id_unique\` ON \`_articles_v_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`workshops_description\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`value\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`workshops\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`workshops_description_order_idx\` ON \`workshops_description\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`workshops_description_parent_id_idx\` ON \`workshops_description\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`workshops_description_locale_idx\` ON \`workshops_description\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`workshops_booking_notes\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`value\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`workshops\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`workshops_booking_notes_order_idx\` ON \`workshops_booking_notes\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`workshops_booking_notes_parent_id_idx\` ON \`workshops_booking_notes\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`workshops_booking_notes_locale_idx\` ON \`workshops_booking_notes\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`workshops\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`slug\` text,
  	\`image_id\` integer NOT NULL,
  	\`price_per_person\` numeric,
  	\`min_participants\` numeric DEFAULT 1 NOT NULL,
  	\`max_participants\` numeric DEFAULT 20 NOT NULL,
  	\`order\` numeric DEFAULT 0,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`workshops_slug_idx\` ON \`workshops\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`workshops_image_idx\` ON \`workshops\` (\`image_id\`);`)
  await db.run(sql`CREATE INDEX \`workshops_updated_at_idx\` ON \`workshops\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`workshops_created_at_idx\` ON \`workshops\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`workshops_locales\` (
  	\`title\` text NOT NULL,
  	\`summary\` text NOT NULL,
  	\`duration\` text NOT NULL,
  	\`takeaway\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`workshops\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`workshops_locales_locale_parent_id_unique\` ON \`workshops_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`places\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`slug\` text,
  	\`kind\` text DEFAULT 'landmark' NOT NULL,
  	\`image_id\` integer NOT NULL,
  	\`order\` numeric DEFAULT 0,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`places_slug_idx\` ON \`places\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`places_image_idx\` ON \`places\` (\`image_id\`);`)
  await db.run(sql`CREATE INDEX \`places_updated_at_idx\` ON \`places\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`places_created_at_idx\` ON \`places\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`places_locales\` (
  	\`name\` text NOT NULL,
  	\`description\` text NOT NULL,
  	\`opening_hours\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`places\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`places_locales_locale_parent_id_unique\` ON \`places_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_heading\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`level\` text DEFAULT '2',
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_heading_order_idx\` ON \`pages_blocks_heading\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_heading_parent_id_idx\` ON \`pages_blocks_heading\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_heading_path_idx\` ON \`pages_blocks_heading\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_heading_locales\` (
  	\`text\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_heading\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`pages_blocks_heading_locales_locale_parent_id_unique\` ON \`pages_blocks_heading_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_paragraph\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_paragraph_order_idx\` ON \`pages_blocks_paragraph\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_paragraph_parent_id_idx\` ON \`pages_blocks_paragraph\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_paragraph_path_idx\` ON \`pages_blocks_paragraph\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_paragraph_locales\` (
  	\`text\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_paragraph\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`pages_blocks_paragraph_locales_locale_parent_id_unique\` ON \`pages_blocks_paragraph_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_list_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`value\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_list\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_list_items_order_idx\` ON \`pages_blocks_list_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_list_items_parent_id_idx\` ON \`pages_blocks_list_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_list_items_locale_idx\` ON \`pages_blocks_list_items\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_list\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`style\` text DEFAULT 'bullet',
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_list_order_idx\` ON \`pages_blocks_list\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_list_parent_id_idx\` ON \`pages_blocks_list\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_list_path_idx\` ON \`pages_blocks_list\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_prose\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`background\` text DEFAULT 'page',
  	\`background_color\` text,
  	\`text_tone\` text DEFAULT 'auto',
  	\`accent_color\` text,
  	\`font_family\` text DEFAULT 'theme',
  	\`text_scale\` text DEFAULT '1',
  	\`text_align\` text DEFAULT 'default',
  	\`content_width\` text DEFAULT 'default',
  	\`spacing\` text DEFAULT 'default',
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_prose_order_idx\` ON \`pages_blocks_prose\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_prose_parent_id_idx\` ON \`pages_blocks_prose\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_prose_path_idx\` ON \`pages_blocks_prose\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_image_text\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	\`image_position\` text DEFAULT 'left',
  	\`button_href\` text,
  	\`background\` text DEFAULT 'page',
  	\`background_color\` text,
  	\`text_tone\` text DEFAULT 'auto',
  	\`accent_color\` text,
  	\`font_family\` text DEFAULT 'theme',
  	\`text_scale\` text DEFAULT '1',
  	\`text_align\` text DEFAULT 'default',
  	\`content_width\` text DEFAULT 'default',
  	\`spacing\` text DEFAULT 'default',
  	\`block_name\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_image_text_order_idx\` ON \`pages_blocks_image_text\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_image_text_parent_id_idx\` ON \`pages_blocks_image_text\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_image_text_path_idx\` ON \`pages_blocks_image_text\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_image_text_image_idx\` ON \`pages_blocks_image_text\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_image_text_locales\` (
  	\`title\` text,
  	\`body\` text,
  	\`button_label\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_image_text\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`pages_blocks_image_text_locales_locale_parent_id_unique\` ON \`pages_blocks_image_text_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_cards_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`icon\` text DEFAULT 'leaf',
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_cards\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_cards_items_order_idx\` ON \`pages_blocks_cards_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_cards_items_parent_id_idx\` ON \`pages_blocks_cards_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_cards_items_locales\` (
  	\`title\` text,
  	\`body\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_cards_items\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`pages_blocks_cards_items_locales_locale_parent_id_unique\` ON \`pages_blocks_cards_items_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_cards\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`background\` text DEFAULT 'page',
  	\`background_color\` text,
  	\`text_tone\` text DEFAULT 'auto',
  	\`accent_color\` text,
  	\`columns\` text DEFAULT 'auto',
  	\`font_family\` text DEFAULT 'theme',
  	\`text_scale\` text DEFAULT '1',
  	\`text_align\` text DEFAULT 'default',
  	\`content_width\` text DEFAULT 'default',
  	\`spacing\` text DEFAULT 'default',
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_cards_order_idx\` ON \`pages_blocks_cards\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_cards_parent_id_idx\` ON \`pages_blocks_cards\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_cards_path_idx\` ON \`pages_blocks_cards\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_cards_locales\` (
  	\`heading_eyebrow\` text,
  	\`heading_title\` text,
  	\`heading_description\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_cards\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`pages_blocks_cards_locales_locale_parent_id_unique\` ON \`pages_blocks_cards_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_stats_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_stats\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_stats_items_order_idx\` ON \`pages_blocks_stats_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_stats_items_parent_id_idx\` ON \`pages_blocks_stats_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_stats_items_locales\` (
  	\`value\` text,
  	\`label\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_stats_items\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`pages_blocks_stats_items_locales_locale_parent_id_unique\` ON \`pages_blocks_stats_items_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_stats\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`background\` text DEFAULT 'page',
  	\`background_color\` text,
  	\`text_tone\` text DEFAULT 'auto',
  	\`accent_color\` text,
  	\`columns\` text DEFAULT 'auto',
  	\`font_family\` text DEFAULT 'theme',
  	\`text_scale\` text DEFAULT '1',
  	\`text_align\` text DEFAULT 'default',
  	\`content_width\` text DEFAULT 'default',
  	\`spacing\` text DEFAULT 'default',
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_stats_order_idx\` ON \`pages_blocks_stats\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_stats_parent_id_idx\` ON \`pages_blocks_stats\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_stats_path_idx\` ON \`pages_blocks_stats\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_stats_locales\` (
  	\`heading_eyebrow\` text,
  	\`heading_title\` text,
  	\`heading_description\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_stats\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`pages_blocks_stats_locales_locale_parent_id_unique\` ON \`pages_blocks_stats_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_gallery_images\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_gallery\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_gallery_images_order_idx\` ON \`pages_blocks_gallery_images\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_gallery_images_parent_id_idx\` ON \`pages_blocks_gallery_images\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_gallery_images_image_idx\` ON \`pages_blocks_gallery_images\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_gallery\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`background\` text DEFAULT 'page',
  	\`background_color\` text,
  	\`text_tone\` text DEFAULT 'auto',
  	\`accent_color\` text,
  	\`columns\` text DEFAULT 'auto',
  	\`font_family\` text DEFAULT 'theme',
  	\`text_scale\` text DEFAULT '1',
  	\`text_align\` text DEFAULT 'default',
  	\`content_width\` text DEFAULT 'default',
  	\`spacing\` text DEFAULT 'default',
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_gallery_order_idx\` ON \`pages_blocks_gallery\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_gallery_parent_id_idx\` ON \`pages_blocks_gallery\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_gallery_path_idx\` ON \`pages_blocks_gallery\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_gallery_locales\` (
  	\`heading_eyebrow\` text,
  	\`heading_title\` text,
  	\`heading_description\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_gallery\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`pages_blocks_gallery_locales_locale_parent_id_unique\` ON \`pages_blocks_gallery_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_collection\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`source\` text DEFAULT 'products',
  	\`limit\` numeric DEFAULT 3,
  	\`link_href\` text,
  	\`background\` text DEFAULT 'page',
  	\`background_color\` text,
  	\`text_tone\` text DEFAULT 'auto',
  	\`accent_color\` text,
  	\`columns\` text DEFAULT 'auto',
  	\`font_family\` text DEFAULT 'theme',
  	\`text_scale\` text DEFAULT '1',
  	\`text_align\` text DEFAULT 'default',
  	\`content_width\` text DEFAULT 'default',
  	\`spacing\` text DEFAULT 'default',
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_collection_order_idx\` ON \`pages_blocks_collection\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_collection_parent_id_idx\` ON \`pages_blocks_collection\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_collection_path_idx\` ON \`pages_blocks_collection\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_collection_locales\` (
  	\`heading_eyebrow\` text,
  	\`heading_title\` text,
  	\`heading_description\` text,
  	\`link_label\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_collection\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`pages_blocks_collection_locales_locale_parent_id_unique\` ON \`pages_blocks_collection_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_cta\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`background\` text DEFAULT 'page',
  	\`background_color\` text,
  	\`text_tone\` text DEFAULT 'auto',
  	\`accent_color\` text,
  	\`font_family\` text DEFAULT 'theme',
  	\`text_scale\` text DEFAULT '1',
  	\`text_align\` text DEFAULT 'default',
  	\`content_width\` text DEFAULT 'default',
  	\`spacing\` text DEFAULT 'default',
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_cta_order_idx\` ON \`pages_blocks_cta\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_cta_parent_id_idx\` ON \`pages_blocks_cta\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_cta_path_idx\` ON \`pages_blocks_cta\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_cta_locales\` (
  	\`eyebrow\` text,
  	\`title\` text,
  	\`body\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_cta\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`pages_blocks_cta_locales_locale_parent_id_unique\` ON \`pages_blocks_cta_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`pages\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`hero_font_family\` text DEFAULT 'theme',
  	\`hero_text_scale\` text DEFAULT '1',
  	\`hero_text_align\` text DEFAULT 'default',
  	\`hero_content_width\` text DEFAULT 'default',
  	\`hero_spacing\` text DEFAULT 'default',
  	\`seo_image_id\` integer,
  	\`show_in_sitemap\` integer DEFAULT true,
  	\`slug\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`_status\` text DEFAULT 'draft',
  	FOREIGN KEY (\`seo_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_seo_image_idx\` ON \`pages\` (\`seo_image_id\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`pages_slug_idx\` ON \`pages\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`pages_updated_at_idx\` ON \`pages\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`pages_created_at_idx\` ON \`pages\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`pages__status_idx\` ON \`pages\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`pages_locales\` (
  	\`title\` text,
  	\`hero_eyebrow\` text,
  	\`hero_title\` text,
  	\`hero_description\` text,
  	\`seo_description\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`pages_locales_locale_parent_id_unique\` ON \`pages_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_heading\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`level\` text DEFAULT '2',
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_heading_order_idx\` ON \`_pages_v_blocks_heading\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_heading_parent_id_idx\` ON \`_pages_v_blocks_heading\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_heading_path_idx\` ON \`_pages_v_blocks_heading\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_heading_locales\` (
  	\`text\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_heading\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_pages_v_blocks_heading_locales_locale_parent_id_unique\` ON \`_pages_v_blocks_heading_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_paragraph\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_paragraph_order_idx\` ON \`_pages_v_blocks_paragraph\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_paragraph_parent_id_idx\` ON \`_pages_v_blocks_paragraph\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_paragraph_path_idx\` ON \`_pages_v_blocks_paragraph\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_paragraph_locales\` (
  	\`text\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_paragraph\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_pages_v_blocks_paragraph_locales_locale_parent_id_unique\` ON \`_pages_v_blocks_paragraph_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_list_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`value\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_list\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_list_items_order_idx\` ON \`_pages_v_blocks_list_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_list_items_parent_id_idx\` ON \`_pages_v_blocks_list_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_list_items_locale_idx\` ON \`_pages_v_blocks_list_items\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_list\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`style\` text DEFAULT 'bullet',
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_list_order_idx\` ON \`_pages_v_blocks_list\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_list_parent_id_idx\` ON \`_pages_v_blocks_list\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_list_path_idx\` ON \`_pages_v_blocks_list\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_prose\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`background\` text DEFAULT 'page',
  	\`background_color\` text,
  	\`text_tone\` text DEFAULT 'auto',
  	\`accent_color\` text,
  	\`font_family\` text DEFAULT 'theme',
  	\`text_scale\` text DEFAULT '1',
  	\`text_align\` text DEFAULT 'default',
  	\`content_width\` text DEFAULT 'default',
  	\`spacing\` text DEFAULT 'default',
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_prose_order_idx\` ON \`_pages_v_blocks_prose\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_prose_parent_id_idx\` ON \`_pages_v_blocks_prose\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_prose_path_idx\` ON \`_pages_v_blocks_prose\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_image_text\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	\`image_position\` text DEFAULT 'left',
  	\`button_href\` text,
  	\`background\` text DEFAULT 'page',
  	\`background_color\` text,
  	\`text_tone\` text DEFAULT 'auto',
  	\`accent_color\` text,
  	\`font_family\` text DEFAULT 'theme',
  	\`text_scale\` text DEFAULT '1',
  	\`text_align\` text DEFAULT 'default',
  	\`content_width\` text DEFAULT 'default',
  	\`spacing\` text DEFAULT 'default',
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_image_text_order_idx\` ON \`_pages_v_blocks_image_text\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_image_text_parent_id_idx\` ON \`_pages_v_blocks_image_text\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_image_text_path_idx\` ON \`_pages_v_blocks_image_text\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_image_text_image_idx\` ON \`_pages_v_blocks_image_text\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_image_text_locales\` (
  	\`title\` text,
  	\`body\` text,
  	\`button_label\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_image_text\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_pages_v_blocks_image_text_locales_locale_parent_id_unique\` ON \`_pages_v_blocks_image_text_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_cards_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`icon\` text DEFAULT 'leaf',
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_cards\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_cards_items_order_idx\` ON \`_pages_v_blocks_cards_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_cards_items_parent_id_idx\` ON \`_pages_v_blocks_cards_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_cards_items_locales\` (
  	\`title\` text,
  	\`body\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_cards_items\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_pages_v_blocks_cards_items_locales_locale_parent_id_unique\` ON \`_pages_v_blocks_cards_items_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_cards\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`background\` text DEFAULT 'page',
  	\`background_color\` text,
  	\`text_tone\` text DEFAULT 'auto',
  	\`accent_color\` text,
  	\`columns\` text DEFAULT 'auto',
  	\`font_family\` text DEFAULT 'theme',
  	\`text_scale\` text DEFAULT '1',
  	\`text_align\` text DEFAULT 'default',
  	\`content_width\` text DEFAULT 'default',
  	\`spacing\` text DEFAULT 'default',
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_cards_order_idx\` ON \`_pages_v_blocks_cards\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_cards_parent_id_idx\` ON \`_pages_v_blocks_cards\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_cards_path_idx\` ON \`_pages_v_blocks_cards\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_cards_locales\` (
  	\`heading_eyebrow\` text,
  	\`heading_title\` text,
  	\`heading_description\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_cards\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_pages_v_blocks_cards_locales_locale_parent_id_unique\` ON \`_pages_v_blocks_cards_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_stats_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_stats\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_stats_items_order_idx\` ON \`_pages_v_blocks_stats_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_stats_items_parent_id_idx\` ON \`_pages_v_blocks_stats_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_stats_items_locales\` (
  	\`value\` text,
  	\`label\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_stats_items\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_pages_v_blocks_stats_items_locales_locale_parent_id_unique\` ON \`_pages_v_blocks_stats_items_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_stats\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`background\` text DEFAULT 'page',
  	\`background_color\` text,
  	\`text_tone\` text DEFAULT 'auto',
  	\`accent_color\` text,
  	\`columns\` text DEFAULT 'auto',
  	\`font_family\` text DEFAULT 'theme',
  	\`text_scale\` text DEFAULT '1',
  	\`text_align\` text DEFAULT 'default',
  	\`content_width\` text DEFAULT 'default',
  	\`spacing\` text DEFAULT 'default',
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_stats_order_idx\` ON \`_pages_v_blocks_stats\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_stats_parent_id_idx\` ON \`_pages_v_blocks_stats\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_stats_path_idx\` ON \`_pages_v_blocks_stats\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_stats_locales\` (
  	\`heading_eyebrow\` text,
  	\`heading_title\` text,
  	\`heading_description\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_stats\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_pages_v_blocks_stats_locales_locale_parent_id_unique\` ON \`_pages_v_blocks_stats_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_gallery_images\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	\`_uuid\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_gallery\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_gallery_images_order_idx\` ON \`_pages_v_blocks_gallery_images\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_gallery_images_parent_id_idx\` ON \`_pages_v_blocks_gallery_images\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_gallery_images_image_idx\` ON \`_pages_v_blocks_gallery_images\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_gallery\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`background\` text DEFAULT 'page',
  	\`background_color\` text,
  	\`text_tone\` text DEFAULT 'auto',
  	\`accent_color\` text,
  	\`columns\` text DEFAULT 'auto',
  	\`font_family\` text DEFAULT 'theme',
  	\`text_scale\` text DEFAULT '1',
  	\`text_align\` text DEFAULT 'default',
  	\`content_width\` text DEFAULT 'default',
  	\`spacing\` text DEFAULT 'default',
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_gallery_order_idx\` ON \`_pages_v_blocks_gallery\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_gallery_parent_id_idx\` ON \`_pages_v_blocks_gallery\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_gallery_path_idx\` ON \`_pages_v_blocks_gallery\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_gallery_locales\` (
  	\`heading_eyebrow\` text,
  	\`heading_title\` text,
  	\`heading_description\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_gallery\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_pages_v_blocks_gallery_locales_locale_parent_id_unique\` ON \`_pages_v_blocks_gallery_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_collection\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`source\` text DEFAULT 'products',
  	\`limit\` numeric DEFAULT 3,
  	\`link_href\` text,
  	\`background\` text DEFAULT 'page',
  	\`background_color\` text,
  	\`text_tone\` text DEFAULT 'auto',
  	\`accent_color\` text,
  	\`columns\` text DEFAULT 'auto',
  	\`font_family\` text DEFAULT 'theme',
  	\`text_scale\` text DEFAULT '1',
  	\`text_align\` text DEFAULT 'default',
  	\`content_width\` text DEFAULT 'default',
  	\`spacing\` text DEFAULT 'default',
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_collection_order_idx\` ON \`_pages_v_blocks_collection\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_collection_parent_id_idx\` ON \`_pages_v_blocks_collection\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_collection_path_idx\` ON \`_pages_v_blocks_collection\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_collection_locales\` (
  	\`heading_eyebrow\` text,
  	\`heading_title\` text,
  	\`heading_description\` text,
  	\`link_label\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_collection\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_pages_v_blocks_collection_locales_locale_parent_id_unique\` ON \`_pages_v_blocks_collection_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_cta\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`background\` text DEFAULT 'page',
  	\`background_color\` text,
  	\`text_tone\` text DEFAULT 'auto',
  	\`accent_color\` text,
  	\`font_family\` text DEFAULT 'theme',
  	\`text_scale\` text DEFAULT '1',
  	\`text_align\` text DEFAULT 'default',
  	\`content_width\` text DEFAULT 'default',
  	\`spacing\` text DEFAULT 'default',
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_cta_order_idx\` ON \`_pages_v_blocks_cta\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_cta_parent_id_idx\` ON \`_pages_v_blocks_cta\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_cta_path_idx\` ON \`_pages_v_blocks_cta\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_cta_locales\` (
  	\`eyebrow\` text,
  	\`title\` text,
  	\`body\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_cta\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_pages_v_blocks_cta_locales_locale_parent_id_unique\` ON \`_pages_v_blocks_cta_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`parent_id\` integer,
  	\`version_hero_font_family\` text DEFAULT 'theme',
  	\`version_hero_text_scale\` text DEFAULT '1',
  	\`version_hero_text_align\` text DEFAULT 'default',
  	\`version_hero_content_width\` text DEFAULT 'default',
  	\`version_hero_spacing\` text DEFAULT 'default',
  	\`version_seo_image_id\` integer,
  	\`version_show_in_sitemap\` integer DEFAULT true,
  	\`version_slug\` text,
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`version__status\` text DEFAULT 'draft',
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`snapshot\` integer,
  	\`published_locale\` text,
  	\`latest\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_seo_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_parent_idx\` ON \`_pages_v\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_version_version_seo_image_idx\` ON \`_pages_v\` (\`version_seo_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_version_version_slug_idx\` ON \`_pages_v\` (\`version_slug\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_version_version_updated_at_idx\` ON \`_pages_v\` (\`version_updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_version_version_created_at_idx\` ON \`_pages_v\` (\`version_created_at\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_version_version__status_idx\` ON \`_pages_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_created_at_idx\` ON \`_pages_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_updated_at_idx\` ON \`_pages_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_snapshot_idx\` ON \`_pages_v\` (\`snapshot\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_published_locale_idx\` ON \`_pages_v\` (\`published_locale\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_latest_idx\` ON \`_pages_v\` (\`latest\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_locales\` (
  	\`version_title\` text,
  	\`version_hero_eyebrow\` text,
  	\`version_hero_title\` text,
  	\`version_hero_description\` text,
  	\`version_seo_description\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_pages_v_locales_locale_parent_id_unique\` ON \`_pages_v_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`enquiries\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`phone\` text NOT NULL,
  	\`topic\` text NOT NULL,
  	\`message\` text NOT NULL,
  	\`status\` text DEFAULT 'new' NOT NULL,
  	\`note\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`enquiries_updated_at_idx\` ON \`enquiries\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`enquiries_created_at_idx\` ON \`enquiries\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`redirects\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`from\` text NOT NULL,
  	\`to\` text NOT NULL,
  	\`permanent\` integer DEFAULT true,
  	\`enabled\` integer DEFAULT true,
  	\`note\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`redirects_from_idx\` ON \`redirects\` (\`from\`);`)
  await db.run(sql`CREATE INDEX \`redirects_updated_at_idx\` ON \`redirects\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`redirects_created_at_idx\` ON \`redirects\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`payload_kv\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`key\` text NOT NULL,
  	\`data\` text NOT NULL
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`payload_kv_key_idx\` ON \`payload_kv\` (\`key\`);`)
  await db.run(sql`CREATE TABLE \`payload_locked_documents\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`global_slug\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_global_slug_idx\` ON \`payload_locked_documents\` (\`global_slug\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_updated_at_idx\` ON \`payload_locked_documents\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_created_at_idx\` ON \`payload_locked_documents\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`payload_locked_documents_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`users_id\` integer,
  	\`media_id\` integer,
  	\`categories_id\` integer,
  	\`artisans_id\` integer,
  	\`products_id\` integer,
  	\`articles_id\` integer,
  	\`workshops_id\` integer,
  	\`places_id\` integer,
  	\`pages_id\` integer,
  	\`enquiries_id\` integer,
  	\`redirects_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_locked_documents\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`categories_id\`) REFERENCES \`categories\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`artisans_id\`) REFERENCES \`artisans\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`products_id\`) REFERENCES \`products\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`articles_id\`) REFERENCES \`articles\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`workshops_id\`) REFERENCES \`workshops\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`places_id\`) REFERENCES \`places\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`pages_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`enquiries_id\`) REFERENCES \`enquiries\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`redirects_id\`) REFERENCES \`redirects\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_order_idx\` ON \`payload_locked_documents_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_parent_idx\` ON \`payload_locked_documents_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_path_idx\` ON \`payload_locked_documents_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_users_id_idx\` ON \`payload_locked_documents_rels\` (\`users_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_media_id_idx\` ON \`payload_locked_documents_rels\` (\`media_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_categories_id_idx\` ON \`payload_locked_documents_rels\` (\`categories_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_artisans_id_idx\` ON \`payload_locked_documents_rels\` (\`artisans_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_products_id_idx\` ON \`payload_locked_documents_rels\` (\`products_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_articles_id_idx\` ON \`payload_locked_documents_rels\` (\`articles_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_workshops_id_idx\` ON \`payload_locked_documents_rels\` (\`workshops_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_places_id_idx\` ON \`payload_locked_documents_rels\` (\`places_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_pages_id_idx\` ON \`payload_locked_documents_rels\` (\`pages_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_enquiries_id_idx\` ON \`payload_locked_documents_rels\` (\`enquiries_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_redirects_id_idx\` ON \`payload_locked_documents_rels\` (\`redirects_id\`);`)
  await db.run(sql`CREATE TABLE \`payload_preferences\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`key\` text,
  	\`value\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_preferences_key_idx\` ON \`payload_preferences\` (\`key\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_updated_at_idx\` ON \`payload_preferences\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_created_at_idx\` ON \`payload_preferences\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`payload_preferences_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`users_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_preferences\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_order_idx\` ON \`payload_preferences_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_parent_idx\` ON \`payload_preferences_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_path_idx\` ON \`payload_preferences_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_users_id_idx\` ON \`payload_preferences_rels\` (\`users_id\`);`)
  await db.run(sql`CREATE TABLE \`payload_migrations\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text,
  	\`batch\` numeric,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_migrations_updated_at_idx\` ON \`payload_migrations\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`payload_migrations_created_at_idx\` ON \`payload_migrations\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`site_settings\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`logo_id\` integer,
  	\`phone\` text,
  	\`phone_display\` text,
  	\`line_id\` text,
  	\`line_url\` text,
  	\`facebook_url\` text,
  	\`email\` text,
  	\`address_locality\` text,
  	\`address_region\` text,
  	\`postal_code\` text,
  	\`map_latitude\` numeric,
  	\`map_longitude\` numeric,
  	\`_status\` text DEFAULT 'draft',
  	\`updated_at\` text,
  	\`created_at\` text,
  	FOREIGN KEY (\`logo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`site_settings_logo_idx\` ON \`site_settings\` (\`logo_id\`);`)
  await db.run(sql`CREATE INDEX \`site_settings__status_idx\` ON \`site_settings\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`site_settings_locales\` (
  	\`community_name\` text,
  	\`community_short_name\` text,
  	\`tagline\` text,
  	\`about_summary\` text,
  	\`address\` text,
  	\`opening_hours\` text,
  	\`opening_hours_short\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`site_settings\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`site_settings_locales_locale_parent_id_unique\` ON \`site_settings_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_site_settings_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`version_logo_id\` integer,
  	\`version_phone\` text,
  	\`version_phone_display\` text,
  	\`version_line_id\` text,
  	\`version_line_url\` text,
  	\`version_facebook_url\` text,
  	\`version_email\` text,
  	\`version_address_locality\` text,
  	\`version_address_region\` text,
  	\`version_postal_code\` text,
  	\`version_map_latitude\` numeric,
  	\`version_map_longitude\` numeric,
  	\`version__status\` text DEFAULT 'draft',
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`snapshot\` integer,
  	\`published_locale\` text,
  	\`latest\` integer,
  	FOREIGN KEY (\`version_logo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`_site_settings_v_version_version_logo_idx\` ON \`_site_settings_v\` (\`version_logo_id\`);`)
  await db.run(sql`CREATE INDEX \`_site_settings_v_version_version__status_idx\` ON \`_site_settings_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_site_settings_v_created_at_idx\` ON \`_site_settings_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_site_settings_v_updated_at_idx\` ON \`_site_settings_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_site_settings_v_snapshot_idx\` ON \`_site_settings_v\` (\`snapshot\`);`)
  await db.run(sql`CREATE INDEX \`_site_settings_v_published_locale_idx\` ON \`_site_settings_v\` (\`published_locale\`);`)
  await db.run(sql`CREATE INDEX \`_site_settings_v_latest_idx\` ON \`_site_settings_v\` (\`latest\`);`)
  await db.run(sql`CREATE TABLE \`_site_settings_v_locales\` (
  	\`version_community_name\` text,
  	\`version_community_short_name\` text,
  	\`version_tagline\` text,
  	\`version_about_summary\` text,
  	\`version_address\` text,
  	\`version_opening_hours\` text,
  	\`version_opening_hours_short\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_site_settings_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_site_settings_v_locales_locale_parent_id_unique\` ON \`_site_settings_v_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`navigation_main_menu_children\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`link_type\` text DEFAULT 'page',
  	\`page\` text,
  	\`custom_page_id\` integer,
  	\`url\` text,
  	FOREIGN KEY (\`custom_page_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`navigation_main_menu\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`navigation_main_menu_children_order_idx\` ON \`navigation_main_menu_children\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`navigation_main_menu_children_parent_id_idx\` ON \`navigation_main_menu_children\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`navigation_main_menu_children_custom_page_idx\` ON \`navigation_main_menu_children\` (\`custom_page_id\`);`)
  await db.run(sql`CREATE TABLE \`navigation_main_menu_children_locales\` (
  	\`label\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`navigation_main_menu_children\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`navigation_main_menu_children_locales_locale_parent_id_uniqu\` ON \`navigation_main_menu_children_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`navigation_main_menu\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`link_type\` text DEFAULT 'page',
  	\`page\` text,
  	\`custom_page_id\` integer,
  	\`url\` text,
  	FOREIGN KEY (\`custom_page_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`navigation\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`navigation_main_menu_order_idx\` ON \`navigation_main_menu\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`navigation_main_menu_parent_id_idx\` ON \`navigation_main_menu\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`navigation_main_menu_custom_page_idx\` ON \`navigation_main_menu\` (\`custom_page_id\`);`)
  await db.run(sql`CREATE TABLE \`navigation_main_menu_locales\` (
  	\`label\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`navigation_main_menu\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`navigation_main_menu_locales_locale_parent_id_unique\` ON \`navigation_main_menu_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`navigation_footer_columns_links\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`link_type\` text DEFAULT 'page',
  	\`page\` text,
  	\`custom_page_id\` integer,
  	\`url\` text,
  	FOREIGN KEY (\`custom_page_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`navigation_footer_columns\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`navigation_footer_columns_links_order_idx\` ON \`navigation_footer_columns_links\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`navigation_footer_columns_links_parent_id_idx\` ON \`navigation_footer_columns_links\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`navigation_footer_columns_links_custom_page_idx\` ON \`navigation_footer_columns_links\` (\`custom_page_id\`);`)
  await db.run(sql`CREATE TABLE \`navigation_footer_columns_links_locales\` (
  	\`label\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`navigation_footer_columns_links\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`navigation_footer_columns_links_locales_locale_parent_id_uni\` ON \`navigation_footer_columns_links_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`navigation_footer_columns\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`navigation\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`navigation_footer_columns_order_idx\` ON \`navigation_footer_columns\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`navigation_footer_columns_parent_id_idx\` ON \`navigation_footer_columns\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`navigation_footer_columns_locales\` (
  	\`heading\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`navigation_footer_columns\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`navigation_footer_columns_locales_locale_parent_id_unique\` ON \`navigation_footer_columns_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`navigation\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`header_cta_enabled\` integer DEFAULT true,
  	\`header_cta_action\` text DEFAULT 'line',
  	\`_status\` text DEFAULT 'draft',
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
  await db.run(sql`CREATE INDEX \`navigation__status_idx\` ON \`navigation\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`navigation_locales\` (
  	\`header_cta_label\` text DEFAULT 'สั่งซื้อ / สอบถาม',
  	\`mobile_menu_title\` text DEFAULT 'เมนู',
  	\`mobile_menu_contact_heading\` text DEFAULT 'ติดต่อชุมชนโดยตรง',
  	\`mobile_menu_line_button_prefix\` text DEFAULT 'แอดไลน์',
  	\`mobile_menu_phone_button_prefix\` text DEFAULT 'โทร',
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`navigation\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`navigation_locales_locale_parent_id_unique\` ON \`navigation_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_navigation_v_version_main_menu_children\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`link_type\` text DEFAULT 'page',
  	\`page\` text,
  	\`custom_page_id\` integer,
  	\`url\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`custom_page_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_navigation_v_version_main_menu\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_navigation_v_version_main_menu_children_order_idx\` ON \`_navigation_v_version_main_menu_children\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_navigation_v_version_main_menu_children_parent_id_idx\` ON \`_navigation_v_version_main_menu_children\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_navigation_v_version_main_menu_children_custom_page_idx\` ON \`_navigation_v_version_main_menu_children\` (\`custom_page_id\`);`)
  await db.run(sql`CREATE TABLE \`_navigation_v_version_main_menu_children_locales\` (
  	\`label\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_navigation_v_version_main_menu_children\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_navigation_v_version_main_menu_children_locales_locale_pare\` ON \`_navigation_v_version_main_menu_children_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_navigation_v_version_main_menu\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`link_type\` text DEFAULT 'page',
  	\`page\` text,
  	\`custom_page_id\` integer,
  	\`url\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`custom_page_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_navigation_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_navigation_v_version_main_menu_order_idx\` ON \`_navigation_v_version_main_menu\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_navigation_v_version_main_menu_parent_id_idx\` ON \`_navigation_v_version_main_menu\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_navigation_v_version_main_menu_custom_page_idx\` ON \`_navigation_v_version_main_menu\` (\`custom_page_id\`);`)
  await db.run(sql`CREATE TABLE \`_navigation_v_version_main_menu_locales\` (
  	\`label\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_navigation_v_version_main_menu\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_navigation_v_version_main_menu_locales_locale_parent_id_uni\` ON \`_navigation_v_version_main_menu_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_navigation_v_version_footer_columns_links\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`link_type\` text DEFAULT 'page',
  	\`page\` text,
  	\`custom_page_id\` integer,
  	\`url\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`custom_page_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_navigation_v_version_footer_columns\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_navigation_v_version_footer_columns_links_order_idx\` ON \`_navigation_v_version_footer_columns_links\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_navigation_v_version_footer_columns_links_parent_id_idx\` ON \`_navigation_v_version_footer_columns_links\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_navigation_v_version_footer_columns_links_custom_page_idx\` ON \`_navigation_v_version_footer_columns_links\` (\`custom_page_id\`);`)
  await db.run(sql`CREATE TABLE \`_navigation_v_version_footer_columns_links_locales\` (
  	\`label\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_navigation_v_version_footer_columns_links\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_navigation_v_version_footer_columns_links_locales_locale_pa\` ON \`_navigation_v_version_footer_columns_links_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_navigation_v_version_footer_columns\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_navigation_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_navigation_v_version_footer_columns_order_idx\` ON \`_navigation_v_version_footer_columns\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_navigation_v_version_footer_columns_parent_id_idx\` ON \`_navigation_v_version_footer_columns\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_navigation_v_version_footer_columns_locales\` (
  	\`heading\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_navigation_v_version_footer_columns\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_navigation_v_version_footer_columns_locales_locale_parent_i\` ON \`_navigation_v_version_footer_columns_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_navigation_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`version_header_cta_enabled\` integer DEFAULT true,
  	\`version_header_cta_action\` text DEFAULT 'line',
  	\`version__status\` text DEFAULT 'draft',
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`snapshot\` integer,
  	\`published_locale\` text,
  	\`latest\` integer
  );
  `)
  await db.run(sql`CREATE INDEX \`_navigation_v_version_version__status_idx\` ON \`_navigation_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_navigation_v_created_at_idx\` ON \`_navigation_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_navigation_v_updated_at_idx\` ON \`_navigation_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_navigation_v_snapshot_idx\` ON \`_navigation_v\` (\`snapshot\`);`)
  await db.run(sql`CREATE INDEX \`_navigation_v_published_locale_idx\` ON \`_navigation_v\` (\`published_locale\`);`)
  await db.run(sql`CREATE INDEX \`_navigation_v_latest_idx\` ON \`_navigation_v\` (\`latest\`);`)
  await db.run(sql`CREATE TABLE \`_navigation_v_locales\` (
  	\`version_header_cta_label\` text DEFAULT 'สั่งซื้อ / สอบถาม',
  	\`version_mobile_menu_title\` text DEFAULT 'เมนู',
  	\`version_mobile_menu_contact_heading\` text DEFAULT 'ติดต่อชุมชนโดยตรง',
  	\`version_mobile_menu_line_button_prefix\` text DEFAULT 'แอดไลน์',
  	\`version_mobile_menu_phone_button_prefix\` text DEFAULT 'โทร',
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_navigation_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_navigation_v_locales_locale_parent_id_unique\` ON \`_navigation_v_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`theme\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`palette\` text DEFAULT 'leaf',
  	\`accent_color\` text DEFAULT '#2e7d52',
  	\`surface\` text DEFAULT 'rice',
  	\`font_pair\` text DEFAULT 'plex-noto',
  	\`base_font_size\` text DEFAULT '16',
  	\`radius\` text DEFAULT 'medium',
  	\`density\` text DEFAULT 'normal',
  	\`custom_css\` text,
  	\`_status\` text DEFAULT 'draft',
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
  await db.run(sql`CREATE INDEX \`theme__status_idx\` ON \`theme\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`_theme_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`version_palette\` text DEFAULT 'leaf',
  	\`version_accent_color\` text DEFAULT '#2e7d52',
  	\`version_surface\` text DEFAULT 'rice',
  	\`version_font_pair\` text DEFAULT 'plex-noto',
  	\`version_base_font_size\` text DEFAULT '16',
  	\`version_radius\` text DEFAULT 'medium',
  	\`version_density\` text DEFAULT 'normal',
  	\`version_custom_css\` text,
  	\`version__status\` text DEFAULT 'draft',
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`snapshot\` integer,
  	\`published_locale\` text,
  	\`latest\` integer
  );
  `)
  await db.run(sql`CREATE INDEX \`_theme_v_version_version__status_idx\` ON \`_theme_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_theme_v_created_at_idx\` ON \`_theme_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_theme_v_updated_at_idx\` ON \`_theme_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_theme_v_snapshot_idx\` ON \`_theme_v\` (\`snapshot\`);`)
  await db.run(sql`CREATE INDEX \`_theme_v_published_locale_idx\` ON \`_theme_v\` (\`published_locale\`);`)
  await db.run(sql`CREATE INDEX \`_theme_v_latest_idx\` ON \`_theme_v\` (\`latest\`);`)
  await db.run(sql`CREATE TABLE \`ui_labels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_status\` text DEFAULT 'draft',
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
  await db.run(sql`CREATE INDEX \`ui_labels__status_idx\` ON \`ui_labels\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`ui_labels_locales\` (
  	\`general_ask_price\` text DEFAULT 'สอบถามราคา',
  	\`general_ask_service_price\` text DEFAULT 'สอบถามค่าบริการ',
  	\`general_view_all_products\` text DEFAULT 'ดูสินค้าทั้งหมด',
  	\`general_view_all_workshops\` text DEFAULT 'ดูกิจกรรมทั้งหมด',
  	\`general_view_all_articles\` text DEFAULT 'ดูบทความทั้งหมด',
  	\`general_read_full_article\` text DEFAULT 'อ่านบทความฉบับเต็ม',
  	\`general_open_in_maps\` text DEFAULT 'เปิดนำทางด้วย Google Maps',
  	\`product_made_by\` text DEFAULT 'ผลิตโดย',
  	\`product_view_artisans\` text DEFAULT 'ดูทำเนียบปราชญ์ชุมชนทั้งหมด →',
  	\`product_specs\` text DEFAULT 'สเปกทางเทคนิค',
  	\`product_sku\` text DEFAULT 'รหัสสินค้า',
  	\`product_form\` text DEFAULT 'รูปแบบ',
  	\`product_net_content\` text DEFAULT 'ปริมาณสุทธิ',
  	\`product_main_herbs\` text DEFAULT 'สมุนไพรหลัก',
  	\`product_shelf_life\` text DEFAULT 'อายุการเก็บรักษา',
  	\`product_external_use_title\` text DEFAULT 'ใช้ภายนอกเท่านั้น',
  	\`product_external_use_body\` text DEFAULT 'ห้ามรับประทาน เก็บให้พ้นมือเด็ก และหลีกเลี่ยงบริเวณดวงตาและบาดแผลเปิด',
  	\`product_call_group\` text DEFAULT 'โทรสอบถามกลุ่มวิสาหกิจชุมชน',
  	\`product_facebook_hint\` text DEFAULT 'หรือทักผ่านเพจ Facebook ของวิสาหกิจชุมชน',
  	\`product_story_eyebrow\` text DEFAULT 'เรื่องเล่าของผลิตภัณฑ์',
  	\`product_story_title\` text DEFAULT 'ที่มาและจุดเด่น',
  	\`product_usage_eyebrow\` text DEFAULT 'วิธีใช้',
  	\`product_usage_title\` text DEFAULT 'ใช้อย่างไร',
  	\`product_care_eyebrow\` text DEFAULT 'คำแนะนำ',
  	\`product_care_title\` text DEFAULT 'การเก็บรักษาและข้อควรระวัง',
  	\`product_related_eyebrow\` text DEFAULT 'อาจถูกใจ',
  	\`product_related_title\` text DEFAULT 'สินค้าที่คล้ายกัน',
  	\`product_filters\` text DEFAULT 'ตัวกรอง',
  	\`product_sort_by\` text DEFAULT 'เรียงตาม',
  	\`product_results_unit\` text DEFAULT 'รายการ',
  	\`article_written_by\` text DEFAULT 'เขียนโดย',
  	\`article_read_time\` text DEFAULT 'ใช้เวลาอ่าน',
  	\`article_minutes\` text DEFAULT 'นาที',
  	\`article_share\` text DEFAULT 'แชร์บทความนี้',
  	\`article_about_author\` text DEFAULT 'เกี่ยวกับผู้เขียน',
  	\`article_about_community_button\` text DEFAULT 'รู้จักชุมชนและครูช่างทั้งหมด',
  	\`article_related_eyebrow\` text DEFAULT 'อ่านต่อ',
  	\`article_related_title\` text DEFAULT 'บทความที่เกี่ยวข้อง',
  	\`article_results_unit\` text DEFAULT 'บทความ',
  	\`tourism_duration\` text DEFAULT 'ระยะเวลา',
  	\`tourism_participants\` text DEFAULT 'จำนวนผู้เข้าร่วม',
  	\`tourism_participants_unit\` text DEFAULT 'คน / รอบ',
  	\`tourism_price\` text DEFAULT 'ค่าบริการ',
  	\`tourism_per_person\` text DEFAULT '/ คน',
  	\`tourism_booking_terms\` text DEFAULT 'เงื่อนไขการจอง',
  	\`tourism_takeaway\` text DEFAULT 'ได้กลับบ้าน:',
  	\`tourism_book_via_line\` text DEFAULT 'จองกิจกรรมผ่าน LINE',
  	\`tourism_call_to_book\` text DEFAULT 'โทรนัดหมาย',
  	\`contact_location\` text DEFAULT 'ที่ตั้ง',
  	\`contact_opening_hours\` text DEFAULT 'เวลาทำการ',
  	\`contact_coordinates\` text DEFAULT 'พิกัด',
  	\`contact_contact_community\` text DEFAULT 'ติดต่อชุมชน',
  	\`contact_directions\` text DEFAULT 'นำทางด้วย Google Maps',
  	\`contact_copyright\` text DEFAULT 'สงวนลิขสิทธิ์',
  	\`about_role\` text DEFAULT 'บทบาท',
  	\`about_source\` text DEFAULT 'ที่มาข้อมูล',
  	\`about_references\` text DEFAULT 'แหล่งอ้างอิง',
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`ui_labels\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`ui_labels_locales_locale_parent_id_unique\` ON \`ui_labels_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_ui_labels_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`version__status\` text DEFAULT 'draft',
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`snapshot\` integer,
  	\`published_locale\` text,
  	\`latest\` integer
  );
  `)
  await db.run(sql`CREATE INDEX \`_ui_labels_v_version_version__status_idx\` ON \`_ui_labels_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_ui_labels_v_created_at_idx\` ON \`_ui_labels_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_ui_labels_v_updated_at_idx\` ON \`_ui_labels_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_ui_labels_v_snapshot_idx\` ON \`_ui_labels_v\` (\`snapshot\`);`)
  await db.run(sql`CREATE INDEX \`_ui_labels_v_published_locale_idx\` ON \`_ui_labels_v\` (\`published_locale\`);`)
  await db.run(sql`CREATE INDEX \`_ui_labels_v_latest_idx\` ON \`_ui_labels_v\` (\`latest\`);`)
  await db.run(sql`CREATE TABLE \`_ui_labels_v_locales\` (
  	\`version_general_ask_price\` text DEFAULT 'สอบถามราคา',
  	\`version_general_ask_service_price\` text DEFAULT 'สอบถามค่าบริการ',
  	\`version_general_view_all_products\` text DEFAULT 'ดูสินค้าทั้งหมด',
  	\`version_general_view_all_workshops\` text DEFAULT 'ดูกิจกรรมทั้งหมด',
  	\`version_general_view_all_articles\` text DEFAULT 'ดูบทความทั้งหมด',
  	\`version_general_read_full_article\` text DEFAULT 'อ่านบทความฉบับเต็ม',
  	\`version_general_open_in_maps\` text DEFAULT 'เปิดนำทางด้วย Google Maps',
  	\`version_product_made_by\` text DEFAULT 'ผลิตโดย',
  	\`version_product_view_artisans\` text DEFAULT 'ดูทำเนียบปราชญ์ชุมชนทั้งหมด →',
  	\`version_product_specs\` text DEFAULT 'สเปกทางเทคนิค',
  	\`version_product_sku\` text DEFAULT 'รหัสสินค้า',
  	\`version_product_form\` text DEFAULT 'รูปแบบ',
  	\`version_product_net_content\` text DEFAULT 'ปริมาณสุทธิ',
  	\`version_product_main_herbs\` text DEFAULT 'สมุนไพรหลัก',
  	\`version_product_shelf_life\` text DEFAULT 'อายุการเก็บรักษา',
  	\`version_product_external_use_title\` text DEFAULT 'ใช้ภายนอกเท่านั้น',
  	\`version_product_external_use_body\` text DEFAULT 'ห้ามรับประทาน เก็บให้พ้นมือเด็ก และหลีกเลี่ยงบริเวณดวงตาและบาดแผลเปิด',
  	\`version_product_call_group\` text DEFAULT 'โทรสอบถามกลุ่มวิสาหกิจชุมชน',
  	\`version_product_facebook_hint\` text DEFAULT 'หรือทักผ่านเพจ Facebook ของวิสาหกิจชุมชน',
  	\`version_product_story_eyebrow\` text DEFAULT 'เรื่องเล่าของผลิตภัณฑ์',
  	\`version_product_story_title\` text DEFAULT 'ที่มาและจุดเด่น',
  	\`version_product_usage_eyebrow\` text DEFAULT 'วิธีใช้',
  	\`version_product_usage_title\` text DEFAULT 'ใช้อย่างไร',
  	\`version_product_care_eyebrow\` text DEFAULT 'คำแนะนำ',
  	\`version_product_care_title\` text DEFAULT 'การเก็บรักษาและข้อควรระวัง',
  	\`version_product_related_eyebrow\` text DEFAULT 'อาจถูกใจ',
  	\`version_product_related_title\` text DEFAULT 'สินค้าที่คล้ายกัน',
  	\`version_product_filters\` text DEFAULT 'ตัวกรอง',
  	\`version_product_sort_by\` text DEFAULT 'เรียงตาม',
  	\`version_product_results_unit\` text DEFAULT 'รายการ',
  	\`version_article_written_by\` text DEFAULT 'เขียนโดย',
  	\`version_article_read_time\` text DEFAULT 'ใช้เวลาอ่าน',
  	\`version_article_minutes\` text DEFAULT 'นาที',
  	\`version_article_share\` text DEFAULT 'แชร์บทความนี้',
  	\`version_article_about_author\` text DEFAULT 'เกี่ยวกับผู้เขียน',
  	\`version_article_about_community_button\` text DEFAULT 'รู้จักชุมชนและครูช่างทั้งหมด',
  	\`version_article_related_eyebrow\` text DEFAULT 'อ่านต่อ',
  	\`version_article_related_title\` text DEFAULT 'บทความที่เกี่ยวข้อง',
  	\`version_article_results_unit\` text DEFAULT 'บทความ',
  	\`version_tourism_duration\` text DEFAULT 'ระยะเวลา',
  	\`version_tourism_participants\` text DEFAULT 'จำนวนผู้เข้าร่วม',
  	\`version_tourism_participants_unit\` text DEFAULT 'คน / รอบ',
  	\`version_tourism_price\` text DEFAULT 'ค่าบริการ',
  	\`version_tourism_per_person\` text DEFAULT '/ คน',
  	\`version_tourism_booking_terms\` text DEFAULT 'เงื่อนไขการจอง',
  	\`version_tourism_takeaway\` text DEFAULT 'ได้กลับบ้าน:',
  	\`version_tourism_book_via_line\` text DEFAULT 'จองกิจกรรมผ่าน LINE',
  	\`version_tourism_call_to_book\` text DEFAULT 'โทรนัดหมาย',
  	\`version_contact_location\` text DEFAULT 'ที่ตั้ง',
  	\`version_contact_opening_hours\` text DEFAULT 'เวลาทำการ',
  	\`version_contact_coordinates\` text DEFAULT 'พิกัด',
  	\`version_contact_contact_community\` text DEFAULT 'ติดต่อชุมชน',
  	\`version_contact_directions\` text DEFAULT 'นำทางด้วย Google Maps',
  	\`version_contact_copyright\` text DEFAULT 'สงวนลิขสิทธิ์',
  	\`version_about_role\` text DEFAULT 'บทบาท',
  	\`version_about_source\` text DEFAULT 'ที่มาข้อมูล',
  	\`version_about_references\` text DEFAULT 'แหล่งอ้างอิง',
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_ui_labels_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_ui_labels_v_locales_locale_parent_id_unique\` ON \`_ui_labels_v_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`seo_settings_keywords\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`value\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`seo_settings\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`seo_settings_keywords_order_idx\` ON \`seo_settings_keywords\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`seo_settings_keywords_parent_id_idx\` ON \`seo_settings_keywords\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`seo_settings_keywords_locale_idx\` ON \`seo_settings_keywords\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`seo_settings\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`default_og_image_id\` integer,
  	\`ga4_measurement_id\` text,
  	\`updated_at\` text,
  	\`created_at\` text,
  	FOREIGN KEY (\`default_og_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`seo_settings_default_og_image_idx\` ON \`seo_settings\` (\`default_og_image_id\`);`)
  await db.run(sql`CREATE TABLE \`home_page_hero_title_lines\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`accent\` integer,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`home_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`home_page_hero_title_lines_order_idx\` ON \`home_page_hero_title_lines\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`home_page_hero_title_lines_parent_id_idx\` ON \`home_page_hero_title_lines\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`home_page_hero_title_lines_locale_idx\` ON \`home_page_hero_title_lines\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`home_page_hero_stats\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`home_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`home_page_hero_stats_order_idx\` ON \`home_page_hero_stats\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`home_page_hero_stats_parent_id_idx\` ON \`home_page_hero_stats\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`home_page_hero_stats_locales\` (
  	\`value\` text,
  	\`label\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`home_page_hero_stats\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`home_page_hero_stats_locales_locale_parent_id_unique\` ON \`home_page_hero_stats_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`home_page_highlights\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`icon\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`home_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`home_page_highlights_order_idx\` ON \`home_page_highlights\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`home_page_highlights_parent_id_idx\` ON \`home_page_highlights\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`home_page_highlights_locales\` (
  	\`title\` text,
  	\`body\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`home_page_highlights\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`home_page_highlights_locales_locale_parent_id_unique\` ON \`home_page_highlights_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`home_page_sections\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`type\` text,
  	\`enabled\` integer DEFAULT true,
  	\`background\` text DEFAULT 'page',
  	\`background_color\` text,
  	\`text_tone\` text DEFAULT 'auto',
  	\`accent_color\` text,
  	\`columns\` text DEFAULT 'auto',
  	\`limit\` numeric,
  	\`font_family\` text DEFAULT 'theme',
  	\`text_scale\` text DEFAULT '1',
  	\`text_align\` text DEFAULT 'default',
  	\`content_width\` text DEFAULT 'default',
  	\`spacing\` text DEFAULT 'default',
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`home_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`home_page_sections_order_idx\` ON \`home_page_sections\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`home_page_sections_parent_id_idx\` ON \`home_page_sections\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`home_page\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`hero_primary_button_href\` text,
  	\`hero_secondary_button_href\` text,
  	\`hero_image_id\` integer,
  	\`hero_font_family\` text DEFAULT 'theme',
  	\`hero_text_scale\` text DEFAULT '1',
  	\`hero_text_align\` text DEFAULT 'default',
  	\`hero_content_width\` text DEFAULT 'default',
  	\`hero_spacing\` text DEFAULT 'default',
  	\`spotlight_article_id\` integer,
  	\`_status\` text DEFAULT 'draft',
  	\`updated_at\` text,
  	\`created_at\` text,
  	FOREIGN KEY (\`hero_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`spotlight_article_id\`) REFERENCES \`articles\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`home_page_hero_hero_image_idx\` ON \`home_page\` (\`hero_image_id\`);`)
  await db.run(sql`CREATE INDEX \`home_page_spotlight_spotlight_article_idx\` ON \`home_page\` (\`spotlight_article_id\`);`)
  await db.run(sql`CREATE INDEX \`home_page__status_idx\` ON \`home_page\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`home_page_locales\` (
  	\`hero_eyebrow\` text,
  	\`hero_subtitle\` text,
  	\`hero_primary_button_label\` text,
  	\`hero_secondary_button_label\` text,
  	\`hero_image_caption\` text,
  	\`featured_section_eyebrow\` text,
  	\`featured_section_title\` text,
  	\`featured_section_description\` text,
  	\`experience_section_eyebrow\` text,
  	\`experience_section_title\` text,
  	\`experience_section_description\` text,
  	\`stories_section_eyebrow\` text,
  	\`stories_section_title\` text,
  	\`stories_section_description\` text,
  	\`spotlight_eyebrow\` text,
  	\`spotlight_quote\` text,
  	\`spotlight_attribution\` text,
  	\`cta_eyebrow\` text,
  	\`cta_title\` text,
  	\`cta_body\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`home_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`home_page_locales_locale_parent_id_unique\` ON \`home_page_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_home_page_v_version_hero_title_lines\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`accent\` integer,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_home_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_home_page_v_version_hero_title_lines_order_idx\` ON \`_home_page_v_version_hero_title_lines\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_version_hero_title_lines_parent_id_idx\` ON \`_home_page_v_version_hero_title_lines\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_version_hero_title_lines_locale_idx\` ON \`_home_page_v_version_hero_title_lines\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_home_page_v_version_hero_stats\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_home_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_home_page_v_version_hero_stats_order_idx\` ON \`_home_page_v_version_hero_stats\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_version_hero_stats_parent_id_idx\` ON \`_home_page_v_version_hero_stats\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_home_page_v_version_hero_stats_locales\` (
  	\`value\` text,
  	\`label\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_home_page_v_version_hero_stats\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_home_page_v_version_hero_stats_locales_locale_parent_id_uni\` ON \`_home_page_v_version_hero_stats_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_home_page_v_version_highlights\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`icon\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_home_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_home_page_v_version_highlights_order_idx\` ON \`_home_page_v_version_highlights\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_version_highlights_parent_id_idx\` ON \`_home_page_v_version_highlights\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_home_page_v_version_highlights_locales\` (
  	\`title\` text,
  	\`body\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_home_page_v_version_highlights\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_home_page_v_version_highlights_locales_locale_parent_id_uni\` ON \`_home_page_v_version_highlights_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_home_page_v_version_sections\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`type\` text,
  	\`enabled\` integer DEFAULT true,
  	\`background\` text DEFAULT 'page',
  	\`background_color\` text,
  	\`text_tone\` text DEFAULT 'auto',
  	\`accent_color\` text,
  	\`columns\` text DEFAULT 'auto',
  	\`limit\` numeric,
  	\`font_family\` text DEFAULT 'theme',
  	\`text_scale\` text DEFAULT '1',
  	\`text_align\` text DEFAULT 'default',
  	\`content_width\` text DEFAULT 'default',
  	\`spacing\` text DEFAULT 'default',
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_home_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_home_page_v_version_sections_order_idx\` ON \`_home_page_v_version_sections\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_version_sections_parent_id_idx\` ON \`_home_page_v_version_sections\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_home_page_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`version_hero_primary_button_href\` text,
  	\`version_hero_secondary_button_href\` text,
  	\`version_hero_image_id\` integer,
  	\`version_hero_font_family\` text DEFAULT 'theme',
  	\`version_hero_text_scale\` text DEFAULT '1',
  	\`version_hero_text_align\` text DEFAULT 'default',
  	\`version_hero_content_width\` text DEFAULT 'default',
  	\`version_hero_spacing\` text DEFAULT 'default',
  	\`version_spotlight_article_id\` integer,
  	\`version__status\` text DEFAULT 'draft',
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`snapshot\` integer,
  	\`published_locale\` text,
  	\`latest\` integer,
  	FOREIGN KEY (\`version_hero_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_spotlight_article_id\`) REFERENCES \`articles\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`_home_page_v_version_hero_version_hero_image_idx\` ON \`_home_page_v\` (\`version_hero_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_version_spotlight_version_spotlight_article_idx\` ON \`_home_page_v\` (\`version_spotlight_article_id\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_version_version__status_idx\` ON \`_home_page_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_created_at_idx\` ON \`_home_page_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_updated_at_idx\` ON \`_home_page_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_snapshot_idx\` ON \`_home_page_v\` (\`snapshot\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_published_locale_idx\` ON \`_home_page_v\` (\`published_locale\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_latest_idx\` ON \`_home_page_v\` (\`latest\`);`)
  await db.run(sql`CREATE TABLE \`_home_page_v_locales\` (
  	\`version_hero_eyebrow\` text,
  	\`version_hero_subtitle\` text,
  	\`version_hero_primary_button_label\` text,
  	\`version_hero_secondary_button_label\` text,
  	\`version_hero_image_caption\` text,
  	\`version_featured_section_eyebrow\` text,
  	\`version_featured_section_title\` text,
  	\`version_featured_section_description\` text,
  	\`version_experience_section_eyebrow\` text,
  	\`version_experience_section_title\` text,
  	\`version_experience_section_description\` text,
  	\`version_stories_section_eyebrow\` text,
  	\`version_stories_section_title\` text,
  	\`version_stories_section_description\` text,
  	\`version_spotlight_eyebrow\` text,
  	\`version_spotlight_quote\` text,
  	\`version_spotlight_attribution\` text,
  	\`version_cta_eyebrow\` text,
  	\`version_cta_title\` text,
  	\`version_cta_body\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_home_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_home_page_v_locales_locale_parent_id_unique\` ON \`_home_page_v_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`about_page_sections\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`type\` text,
  	\`enabled\` integer DEFAULT true,
  	\`background\` text DEFAULT 'page',
  	\`background_color\` text,
  	\`text_tone\` text DEFAULT 'auto',
  	\`accent_color\` text,
  	\`columns\` text DEFAULT 'auto',
  	\`limit\` numeric,
  	\`font_family\` text DEFAULT 'theme',
  	\`text_scale\` text DEFAULT '1',
  	\`text_align\` text DEFAULT 'default',
  	\`content_width\` text DEFAULT 'default',
  	\`spacing\` text DEFAULT 'default',
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`about_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`about_page_sections_order_idx\` ON \`about_page_sections\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`about_page_sections_parent_id_idx\` ON \`about_page_sections\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`about_page_blocks_heading\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`about_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`about_page_blocks_heading_order_idx\` ON \`about_page_blocks_heading\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`about_page_blocks_heading_parent_id_idx\` ON \`about_page_blocks_heading\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`about_page_blocks_heading_path_idx\` ON \`about_page_blocks_heading\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`about_page_blocks_heading_locales\` (
  	\`text\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`about_page_blocks_heading\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`about_page_blocks_heading_locales_locale_parent_id_unique\` ON \`about_page_blocks_heading_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`about_page_blocks_paragraph\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`about_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`about_page_blocks_paragraph_order_idx\` ON \`about_page_blocks_paragraph\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`about_page_blocks_paragraph_parent_id_idx\` ON \`about_page_blocks_paragraph\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`about_page_blocks_paragraph_path_idx\` ON \`about_page_blocks_paragraph\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`about_page_blocks_paragraph_locales\` (
  	\`text\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`about_page_blocks_paragraph\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`about_page_blocks_paragraph_locales_locale_parent_id_unique\` ON \`about_page_blocks_paragraph_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`about_page_facts\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`about_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`about_page_facts_order_idx\` ON \`about_page_facts\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`about_page_facts_parent_id_idx\` ON \`about_page_facts\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`about_page_facts_locales\` (
  	\`value\` text,
  	\`label\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`about_page_facts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`about_page_facts_locales_locale_parent_id_unique\` ON \`about_page_facts_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`about_page_assets\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`about_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`about_page_assets_order_idx\` ON \`about_page_assets\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`about_page_assets_parent_id_idx\` ON \`about_page_assets\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`about_page_assets_locales\` (
  	\`title\` text,
  	\`body\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`about_page_assets\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`about_page_assets_locales_locale_parent_id_unique\` ON \`about_page_assets_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`about_page_references\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`value\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`about_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`about_page_references_order_idx\` ON \`about_page_references\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`about_page_references_parent_id_idx\` ON \`about_page_references\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`about_page_references_locale_idx\` ON \`about_page_references\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`about_page\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`hero_font_family\` text DEFAULT 'theme',
  	\`hero_text_scale\` text DEFAULT '1',
  	\`hero_text_align\` text DEFAULT 'default',
  	\`hero_content_width\` text DEFAULT 'default',
  	\`hero_spacing\` text DEFAULT 'default',
  	\`history_image_id\` integer,
  	\`history_link_href\` text,
  	\`closing_image_id\` integer,
  	\`closing_primary_button_href\` text,
  	\`closing_secondary_button_href\` text,
  	\`_status\` text DEFAULT 'draft',
  	\`updated_at\` text,
  	\`created_at\` text,
  	FOREIGN KEY (\`history_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`closing_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`about_page_history_image_idx\` ON \`about_page\` (\`history_image_id\`);`)
  await db.run(sql`CREATE INDEX \`about_page_closing_closing_image_idx\` ON \`about_page\` (\`closing_image_id\`);`)
  await db.run(sql`CREATE INDEX \`about_page__status_idx\` ON \`about_page\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`about_page_locales\` (
  	\`hero_eyebrow\` text,
  	\`hero_title\` text,
  	\`hero_description\` text,
  	\`history_section_eyebrow\` text,
  	\`history_section_title\` text,
  	\`history_section_description\` text,
  	\`history_link_label\` text,
  	\`assets_section_eyebrow\` text,
  	\`assets_section_title\` text,
  	\`assets_section_description\` text,
  	\`artisans_section_eyebrow\` text,
  	\`artisans_section_title\` text,
  	\`artisans_section_description\` text,
  	\`closing_title\` text,
  	\`closing_body\` text,
  	\`closing_primary_button_label\` text,
  	\`closing_secondary_button_label\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`about_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`about_page_locales_locale_parent_id_unique\` ON \`about_page_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_about_page_v_version_sections\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`type\` text,
  	\`enabled\` integer DEFAULT true,
  	\`background\` text DEFAULT 'page',
  	\`background_color\` text,
  	\`text_tone\` text DEFAULT 'auto',
  	\`accent_color\` text,
  	\`columns\` text DEFAULT 'auto',
  	\`limit\` numeric,
  	\`font_family\` text DEFAULT 'theme',
  	\`text_scale\` text DEFAULT '1',
  	\`text_align\` text DEFAULT 'default',
  	\`content_width\` text DEFAULT 'default',
  	\`spacing\` text DEFAULT 'default',
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_about_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_about_page_v_version_sections_order_idx\` ON \`_about_page_v_version_sections\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_about_page_v_version_sections_parent_id_idx\` ON \`_about_page_v_version_sections\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_about_page_v_blocks_heading\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_about_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_about_page_v_blocks_heading_order_idx\` ON \`_about_page_v_blocks_heading\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_about_page_v_blocks_heading_parent_id_idx\` ON \`_about_page_v_blocks_heading\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_about_page_v_blocks_heading_path_idx\` ON \`_about_page_v_blocks_heading\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_about_page_v_blocks_heading_locales\` (
  	\`text\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_about_page_v_blocks_heading\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_about_page_v_blocks_heading_locales_locale_parent_id_unique\` ON \`_about_page_v_blocks_heading_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_about_page_v_blocks_paragraph\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_about_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_about_page_v_blocks_paragraph_order_idx\` ON \`_about_page_v_blocks_paragraph\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_about_page_v_blocks_paragraph_parent_id_idx\` ON \`_about_page_v_blocks_paragraph\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_about_page_v_blocks_paragraph_path_idx\` ON \`_about_page_v_blocks_paragraph\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_about_page_v_blocks_paragraph_locales\` (
  	\`text\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_about_page_v_blocks_paragraph\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_about_page_v_blocks_paragraph_locales_locale_parent_id_uniq\` ON \`_about_page_v_blocks_paragraph_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_about_page_v_version_facts\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_about_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_about_page_v_version_facts_order_idx\` ON \`_about_page_v_version_facts\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_about_page_v_version_facts_parent_id_idx\` ON \`_about_page_v_version_facts\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_about_page_v_version_facts_locales\` (
  	\`value\` text,
  	\`label\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_about_page_v_version_facts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_about_page_v_version_facts_locales_locale_parent_id_unique\` ON \`_about_page_v_version_facts_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_about_page_v_version_assets\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_about_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_about_page_v_version_assets_order_idx\` ON \`_about_page_v_version_assets\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_about_page_v_version_assets_parent_id_idx\` ON \`_about_page_v_version_assets\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_about_page_v_version_assets_locales\` (
  	\`title\` text,
  	\`body\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_about_page_v_version_assets\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_about_page_v_version_assets_locales_locale_parent_id_unique\` ON \`_about_page_v_version_assets_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_about_page_v_version_references\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`value\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_about_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_about_page_v_version_references_order_idx\` ON \`_about_page_v_version_references\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_about_page_v_version_references_parent_id_idx\` ON \`_about_page_v_version_references\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_about_page_v_version_references_locale_idx\` ON \`_about_page_v_version_references\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_about_page_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`version_hero_font_family\` text DEFAULT 'theme',
  	\`version_hero_text_scale\` text DEFAULT '1',
  	\`version_hero_text_align\` text DEFAULT 'default',
  	\`version_hero_content_width\` text DEFAULT 'default',
  	\`version_hero_spacing\` text DEFAULT 'default',
  	\`version_history_image_id\` integer,
  	\`version_history_link_href\` text,
  	\`version_closing_image_id\` integer,
  	\`version_closing_primary_button_href\` text,
  	\`version_closing_secondary_button_href\` text,
  	\`version__status\` text DEFAULT 'draft',
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`snapshot\` integer,
  	\`published_locale\` text,
  	\`latest\` integer,
  	FOREIGN KEY (\`version_history_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_closing_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`_about_page_v_version_version_history_image_idx\` ON \`_about_page_v\` (\`version_history_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_about_page_v_version_closing_version_closing_image_idx\` ON \`_about_page_v\` (\`version_closing_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_about_page_v_version_version__status_idx\` ON \`_about_page_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_about_page_v_created_at_idx\` ON \`_about_page_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_about_page_v_updated_at_idx\` ON \`_about_page_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_about_page_v_snapshot_idx\` ON \`_about_page_v\` (\`snapshot\`);`)
  await db.run(sql`CREATE INDEX \`_about_page_v_published_locale_idx\` ON \`_about_page_v\` (\`published_locale\`);`)
  await db.run(sql`CREATE INDEX \`_about_page_v_latest_idx\` ON \`_about_page_v\` (\`latest\`);`)
  await db.run(sql`CREATE TABLE \`_about_page_v_locales\` (
  	\`version_hero_eyebrow\` text,
  	\`version_hero_title\` text,
  	\`version_hero_description\` text,
  	\`version_history_section_eyebrow\` text,
  	\`version_history_section_title\` text,
  	\`version_history_section_description\` text,
  	\`version_history_link_label\` text,
  	\`version_assets_section_eyebrow\` text,
  	\`version_assets_section_title\` text,
  	\`version_assets_section_description\` text,
  	\`version_artisans_section_eyebrow\` text,
  	\`version_artisans_section_title\` text,
  	\`version_artisans_section_description\` text,
  	\`version_closing_title\` text,
  	\`version_closing_body\` text,
  	\`version_closing_primary_button_label\` text,
  	\`version_closing_secondary_button_label\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_about_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_about_page_v_locales_locale_parent_id_unique\` ON \`_about_page_v_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`shop_page_sections\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`type\` text,
  	\`enabled\` integer DEFAULT true,
  	\`background\` text DEFAULT 'page',
  	\`background_color\` text,
  	\`text_tone\` text DEFAULT 'auto',
  	\`accent_color\` text,
  	\`columns\` text DEFAULT 'auto',
  	\`limit\` numeric,
  	\`font_family\` text DEFAULT 'theme',
  	\`text_scale\` text DEFAULT '1',
  	\`text_align\` text DEFAULT 'default',
  	\`content_width\` text DEFAULT 'default',
  	\`spacing\` text DEFAULT 'default',
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`shop_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`shop_page_sections_order_idx\` ON \`shop_page_sections\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`shop_page_sections_parent_id_idx\` ON \`shop_page_sections\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`shop_page\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`hero_font_family\` text DEFAULT 'theme',
  	\`hero_text_scale\` text DEFAULT '1',
  	\`hero_text_align\` text DEFAULT 'default',
  	\`hero_content_width\` text DEFAULT 'default',
  	\`hero_spacing\` text DEFAULT 'default',
  	\`_status\` text DEFAULT 'draft',
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
  await db.run(sql`CREATE INDEX \`shop_page__status_idx\` ON \`shop_page\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`shop_page_locales\` (
  	\`hero_eyebrow\` text,
  	\`hero_title\` text,
  	\`hero_description\` text,
  	\`empty_state_title\` text,
  	\`empty_state_body\` text,
  	\`cta_eyebrow\` text,
  	\`cta_title\` text,
  	\`cta_body\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`shop_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`shop_page_locales_locale_parent_id_unique\` ON \`shop_page_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_shop_page_v_version_sections\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`type\` text,
  	\`enabled\` integer DEFAULT true,
  	\`background\` text DEFAULT 'page',
  	\`background_color\` text,
  	\`text_tone\` text DEFAULT 'auto',
  	\`accent_color\` text,
  	\`columns\` text DEFAULT 'auto',
  	\`limit\` numeric,
  	\`font_family\` text DEFAULT 'theme',
  	\`text_scale\` text DEFAULT '1',
  	\`text_align\` text DEFAULT 'default',
  	\`content_width\` text DEFAULT 'default',
  	\`spacing\` text DEFAULT 'default',
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_shop_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_shop_page_v_version_sections_order_idx\` ON \`_shop_page_v_version_sections\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_shop_page_v_version_sections_parent_id_idx\` ON \`_shop_page_v_version_sections\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_shop_page_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`version_hero_font_family\` text DEFAULT 'theme',
  	\`version_hero_text_scale\` text DEFAULT '1',
  	\`version_hero_text_align\` text DEFAULT 'default',
  	\`version_hero_content_width\` text DEFAULT 'default',
  	\`version_hero_spacing\` text DEFAULT 'default',
  	\`version__status\` text DEFAULT 'draft',
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`snapshot\` integer,
  	\`published_locale\` text,
  	\`latest\` integer
  );
  `)
  await db.run(sql`CREATE INDEX \`_shop_page_v_version_version__status_idx\` ON \`_shop_page_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_shop_page_v_created_at_idx\` ON \`_shop_page_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_shop_page_v_updated_at_idx\` ON \`_shop_page_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_shop_page_v_snapshot_idx\` ON \`_shop_page_v\` (\`snapshot\`);`)
  await db.run(sql`CREATE INDEX \`_shop_page_v_published_locale_idx\` ON \`_shop_page_v\` (\`published_locale\`);`)
  await db.run(sql`CREATE INDEX \`_shop_page_v_latest_idx\` ON \`_shop_page_v\` (\`latest\`);`)
  await db.run(sql`CREATE TABLE \`_shop_page_v_locales\` (
  	\`version_hero_eyebrow\` text,
  	\`version_hero_title\` text,
  	\`version_hero_description\` text,
  	\`version_empty_state_title\` text,
  	\`version_empty_state_body\` text,
  	\`version_cta_eyebrow\` text,
  	\`version_cta_title\` text,
  	\`version_cta_body\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_shop_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_shop_page_v_locales_locale_parent_id_unique\` ON \`_shop_page_v_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`stories_page_sections\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`type\` text,
  	\`enabled\` integer DEFAULT true,
  	\`background\` text DEFAULT 'page',
  	\`background_color\` text,
  	\`text_tone\` text DEFAULT 'auto',
  	\`accent_color\` text,
  	\`columns\` text DEFAULT 'auto',
  	\`limit\` numeric,
  	\`font_family\` text DEFAULT 'theme',
  	\`text_scale\` text DEFAULT '1',
  	\`text_align\` text DEFAULT 'default',
  	\`content_width\` text DEFAULT 'default',
  	\`spacing\` text DEFAULT 'default',
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`stories_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`stories_page_sections_order_idx\` ON \`stories_page_sections\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`stories_page_sections_parent_id_idx\` ON \`stories_page_sections\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`stories_page\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`hero_font_family\` text DEFAULT 'theme',
  	\`hero_text_scale\` text DEFAULT '1',
  	\`hero_text_align\` text DEFAULT 'default',
  	\`hero_content_width\` text DEFAULT 'default',
  	\`hero_spacing\` text DEFAULT 'default',
  	\`_status\` text DEFAULT 'draft',
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
  await db.run(sql`CREATE INDEX \`stories_page__status_idx\` ON \`stories_page\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`stories_page_locales\` (
  	\`hero_eyebrow\` text,
  	\`hero_title\` text,
  	\`hero_description\` text,
  	\`empty_state_title\` text,
  	\`empty_state_body\` text,
  	\`cta_eyebrow\` text,
  	\`cta_title\` text,
  	\`cta_body\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`stories_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`stories_page_locales_locale_parent_id_unique\` ON \`stories_page_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_stories_page_v_version_sections\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`type\` text,
  	\`enabled\` integer DEFAULT true,
  	\`background\` text DEFAULT 'page',
  	\`background_color\` text,
  	\`text_tone\` text DEFAULT 'auto',
  	\`accent_color\` text,
  	\`columns\` text DEFAULT 'auto',
  	\`limit\` numeric,
  	\`font_family\` text DEFAULT 'theme',
  	\`text_scale\` text DEFAULT '1',
  	\`text_align\` text DEFAULT 'default',
  	\`content_width\` text DEFAULT 'default',
  	\`spacing\` text DEFAULT 'default',
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_stories_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_stories_page_v_version_sections_order_idx\` ON \`_stories_page_v_version_sections\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_stories_page_v_version_sections_parent_id_idx\` ON \`_stories_page_v_version_sections\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_stories_page_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`version_hero_font_family\` text DEFAULT 'theme',
  	\`version_hero_text_scale\` text DEFAULT '1',
  	\`version_hero_text_align\` text DEFAULT 'default',
  	\`version_hero_content_width\` text DEFAULT 'default',
  	\`version_hero_spacing\` text DEFAULT 'default',
  	\`version__status\` text DEFAULT 'draft',
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`snapshot\` integer,
  	\`published_locale\` text,
  	\`latest\` integer
  );
  `)
  await db.run(sql`CREATE INDEX \`_stories_page_v_version_version__status_idx\` ON \`_stories_page_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_stories_page_v_created_at_idx\` ON \`_stories_page_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_stories_page_v_updated_at_idx\` ON \`_stories_page_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_stories_page_v_snapshot_idx\` ON \`_stories_page_v\` (\`snapshot\`);`)
  await db.run(sql`CREATE INDEX \`_stories_page_v_published_locale_idx\` ON \`_stories_page_v\` (\`published_locale\`);`)
  await db.run(sql`CREATE INDEX \`_stories_page_v_latest_idx\` ON \`_stories_page_v\` (\`latest\`);`)
  await db.run(sql`CREATE TABLE \`_stories_page_v_locales\` (
  	\`version_hero_eyebrow\` text,
  	\`version_hero_title\` text,
  	\`version_hero_description\` text,
  	\`version_empty_state_title\` text,
  	\`version_empty_state_body\` text,
  	\`version_cta_eyebrow\` text,
  	\`version_cta_title\` text,
  	\`version_cta_body\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_stories_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_stories_page_v_locales_locale_parent_id_unique\` ON \`_stories_page_v_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`tourism_page_sections\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`type\` text,
  	\`enabled\` integer DEFAULT true,
  	\`background\` text DEFAULT 'page',
  	\`background_color\` text,
  	\`text_tone\` text DEFAULT 'auto',
  	\`accent_color\` text,
  	\`columns\` text DEFAULT 'auto',
  	\`limit\` numeric,
  	\`font_family\` text DEFAULT 'theme',
  	\`text_scale\` text DEFAULT '1',
  	\`text_align\` text DEFAULT 'default',
  	\`content_width\` text DEFAULT 'default',
  	\`spacing\` text DEFAULT 'default',
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`tourism_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`tourism_page_sections_order_idx\` ON \`tourism_page_sections\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`tourism_page_sections_parent_id_idx\` ON \`tourism_page_sections\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`tourism_page_travel_options\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`tourism_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`tourism_page_travel_options_order_idx\` ON \`tourism_page_travel_options\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`tourism_page_travel_options_parent_id_idx\` ON \`tourism_page_travel_options\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`tourism_page_travel_options_locales\` (
  	\`title\` text,
  	\`body\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`tourism_page_travel_options\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`tourism_page_travel_options_locales_locale_parent_id_unique\` ON \`tourism_page_travel_options_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`tourism_page\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`hero_font_family\` text DEFAULT 'theme',
  	\`hero_text_scale\` text DEFAULT '1',
  	\`hero_text_align\` text DEFAULT 'default',
  	\`hero_content_width\` text DEFAULT 'default',
  	\`hero_spacing\` text DEFAULT 'default',
  	\`_status\` text DEFAULT 'draft',
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
  await db.run(sql`CREATE INDEX \`tourism_page__status_idx\` ON \`tourism_page\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`tourism_page_locales\` (
  	\`hero_eyebrow\` text,
  	\`hero_title\` text,
  	\`hero_description\` text,
  	\`workshops_section_eyebrow\` text,
  	\`workshops_section_title\` text,
  	\`workshops_section_description\` text,
  	\`places_section_eyebrow\` text,
  	\`places_section_title\` text,
  	\`places_section_description\` text,
  	\`travel_section_eyebrow\` text,
  	\`travel_section_title\` text,
  	\`travel_section_description\` text,
  	\`cta_eyebrow\` text,
  	\`cta_title\` text,
  	\`cta_body\` text,
  	\`notice_title\` text,
  	\`notice_body\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`tourism_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`tourism_page_locales_locale_parent_id_unique\` ON \`tourism_page_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_tourism_page_v_version_sections\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`type\` text,
  	\`enabled\` integer DEFAULT true,
  	\`background\` text DEFAULT 'page',
  	\`background_color\` text,
  	\`text_tone\` text DEFAULT 'auto',
  	\`accent_color\` text,
  	\`columns\` text DEFAULT 'auto',
  	\`limit\` numeric,
  	\`font_family\` text DEFAULT 'theme',
  	\`text_scale\` text DEFAULT '1',
  	\`text_align\` text DEFAULT 'default',
  	\`content_width\` text DEFAULT 'default',
  	\`spacing\` text DEFAULT 'default',
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_tourism_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_tourism_page_v_version_sections_order_idx\` ON \`_tourism_page_v_version_sections\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_tourism_page_v_version_sections_parent_id_idx\` ON \`_tourism_page_v_version_sections\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_tourism_page_v_version_travel_options\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_tourism_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_tourism_page_v_version_travel_options_order_idx\` ON \`_tourism_page_v_version_travel_options\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_tourism_page_v_version_travel_options_parent_id_idx\` ON \`_tourism_page_v_version_travel_options\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_tourism_page_v_version_travel_options_locales\` (
  	\`title\` text,
  	\`body\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_tourism_page_v_version_travel_options\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_tourism_page_v_version_travel_options_locales_locale_parent\` ON \`_tourism_page_v_version_travel_options_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_tourism_page_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`version_hero_font_family\` text DEFAULT 'theme',
  	\`version_hero_text_scale\` text DEFAULT '1',
  	\`version_hero_text_align\` text DEFAULT 'default',
  	\`version_hero_content_width\` text DEFAULT 'default',
  	\`version_hero_spacing\` text DEFAULT 'default',
  	\`version__status\` text DEFAULT 'draft',
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`snapshot\` integer,
  	\`published_locale\` text,
  	\`latest\` integer
  );
  `)
  await db.run(sql`CREATE INDEX \`_tourism_page_v_version_version__status_idx\` ON \`_tourism_page_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_tourism_page_v_created_at_idx\` ON \`_tourism_page_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_tourism_page_v_updated_at_idx\` ON \`_tourism_page_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_tourism_page_v_snapshot_idx\` ON \`_tourism_page_v\` (\`snapshot\`);`)
  await db.run(sql`CREATE INDEX \`_tourism_page_v_published_locale_idx\` ON \`_tourism_page_v\` (\`published_locale\`);`)
  await db.run(sql`CREATE INDEX \`_tourism_page_v_latest_idx\` ON \`_tourism_page_v\` (\`latest\`);`)
  await db.run(sql`CREATE TABLE \`_tourism_page_v_locales\` (
  	\`version_hero_eyebrow\` text,
  	\`version_hero_title\` text,
  	\`version_hero_description\` text,
  	\`version_workshops_section_eyebrow\` text,
  	\`version_workshops_section_title\` text,
  	\`version_workshops_section_description\` text,
  	\`version_places_section_eyebrow\` text,
  	\`version_places_section_title\` text,
  	\`version_places_section_description\` text,
  	\`version_travel_section_eyebrow\` text,
  	\`version_travel_section_title\` text,
  	\`version_travel_section_description\` text,
  	\`version_cta_eyebrow\` text,
  	\`version_cta_title\` text,
  	\`version_cta_body\` text,
  	\`version_notice_title\` text,
  	\`version_notice_body\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_tourism_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_tourism_page_v_locales_locale_parent_id_unique\` ON \`_tourism_page_v_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`contact_page_sections\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`type\` text,
  	\`enabled\` integer DEFAULT true,
  	\`background\` text DEFAULT 'page',
  	\`background_color\` text,
  	\`text_tone\` text DEFAULT 'auto',
  	\`accent_color\` text,
  	\`columns\` text DEFAULT 'auto',
  	\`limit\` numeric,
  	\`font_family\` text DEFAULT 'theme',
  	\`text_scale\` text DEFAULT '1',
  	\`text_align\` text DEFAULT 'default',
  	\`content_width\` text DEFAULT 'default',
  	\`spacing\` text DEFAULT 'default',
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`contact_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`contact_page_sections_order_idx\` ON \`contact_page_sections\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`contact_page_sections_parent_id_idx\` ON \`contact_page_sections\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`contact_page_channels\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`channel\` text,
  	\`highlight\` integer,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`contact_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`contact_page_channels_order_idx\` ON \`contact_page_channels\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`contact_page_channels_parent_id_idx\` ON \`contact_page_channels\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`contact_page_channels_locales\` (
  	\`label\` text,
  	\`note\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`contact_page_channels\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`contact_page_channels_locales_locale_parent_id_unique\` ON \`contact_page_channels_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`contact_page_form_topics\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`value\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`contact_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`contact_page_form_topics_order_idx\` ON \`contact_page_form_topics\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`contact_page_form_topics_parent_id_idx\` ON \`contact_page_form_topics\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`contact_page_form_topics_locale_idx\` ON \`contact_page_form_topics\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`contact_page\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`hero_font_family\` text DEFAULT 'theme',
  	\`hero_text_scale\` text DEFAULT '1',
  	\`hero_text_align\` text DEFAULT 'default',
  	\`hero_content_width\` text DEFAULT 'default',
  	\`hero_spacing\` text DEFAULT 'default',
  	\`_status\` text DEFAULT 'draft',
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
  await db.run(sql`CREATE INDEX \`contact_page__status_idx\` ON \`contact_page\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`contact_page_locales\` (
  	\`hero_eyebrow\` text,
  	\`hero_title\` text,
  	\`hero_description\` text,
  	\`form_section_eyebrow\` text,
  	\`form_section_title\` text,
  	\`form_section_description\` text,
  	\`form_success_title\` text,
  	\`form_success_body\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`contact_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`contact_page_locales_locale_parent_id_unique\` ON \`contact_page_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_contact_page_v_version_sections\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`type\` text,
  	\`enabled\` integer DEFAULT true,
  	\`background\` text DEFAULT 'page',
  	\`background_color\` text,
  	\`text_tone\` text DEFAULT 'auto',
  	\`accent_color\` text,
  	\`columns\` text DEFAULT 'auto',
  	\`limit\` numeric,
  	\`font_family\` text DEFAULT 'theme',
  	\`text_scale\` text DEFAULT '1',
  	\`text_align\` text DEFAULT 'default',
  	\`content_width\` text DEFAULT 'default',
  	\`spacing\` text DEFAULT 'default',
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_contact_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_contact_page_v_version_sections_order_idx\` ON \`_contact_page_v_version_sections\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_contact_page_v_version_sections_parent_id_idx\` ON \`_contact_page_v_version_sections\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_contact_page_v_version_channels\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`channel\` text,
  	\`highlight\` integer,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_contact_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_contact_page_v_version_channels_order_idx\` ON \`_contact_page_v_version_channels\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_contact_page_v_version_channels_parent_id_idx\` ON \`_contact_page_v_version_channels\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_contact_page_v_version_channels_locales\` (
  	\`label\` text,
  	\`note\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_contact_page_v_version_channels\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_contact_page_v_version_channels_locales_locale_parent_id_un\` ON \`_contact_page_v_version_channels_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_contact_page_v_version_form_topics\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`value\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_contact_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_contact_page_v_version_form_topics_order_idx\` ON \`_contact_page_v_version_form_topics\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_contact_page_v_version_form_topics_parent_id_idx\` ON \`_contact_page_v_version_form_topics\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_contact_page_v_version_form_topics_locale_idx\` ON \`_contact_page_v_version_form_topics\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_contact_page_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`version_hero_font_family\` text DEFAULT 'theme',
  	\`version_hero_text_scale\` text DEFAULT '1',
  	\`version_hero_text_align\` text DEFAULT 'default',
  	\`version_hero_content_width\` text DEFAULT 'default',
  	\`version_hero_spacing\` text DEFAULT 'default',
  	\`version__status\` text DEFAULT 'draft',
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`snapshot\` integer,
  	\`published_locale\` text,
  	\`latest\` integer
  );
  `)
  await db.run(sql`CREATE INDEX \`_contact_page_v_version_version__status_idx\` ON \`_contact_page_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_contact_page_v_created_at_idx\` ON \`_contact_page_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_contact_page_v_updated_at_idx\` ON \`_contact_page_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_contact_page_v_snapshot_idx\` ON \`_contact_page_v\` (\`snapshot\`);`)
  await db.run(sql`CREATE INDEX \`_contact_page_v_published_locale_idx\` ON \`_contact_page_v\` (\`published_locale\`);`)
  await db.run(sql`CREATE INDEX \`_contact_page_v_latest_idx\` ON \`_contact_page_v\` (\`latest\`);`)
  await db.run(sql`CREATE TABLE \`_contact_page_v_locales\` (
  	\`version_hero_eyebrow\` text,
  	\`version_hero_title\` text,
  	\`version_hero_description\` text,
  	\`version_form_section_eyebrow\` text,
  	\`version_form_section_title\` text,
  	\`version_form_section_description\` text,
  	\`version_form_success_title\` text,
  	\`version_form_success_body\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_contact_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_contact_page_v_locales_locale_parent_id_unique\` ON \`_contact_page_v_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`not_found_page_buttons\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`href\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`not_found_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`not_found_page_buttons_order_idx\` ON \`not_found_page_buttons\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`not_found_page_buttons_parent_id_idx\` ON \`not_found_page_buttons\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`not_found_page_buttons_locales\` (
  	\`label\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`not_found_page_buttons\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`not_found_page_buttons_locales_locale_parent_id_unique\` ON \`not_found_page_buttons_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`not_found_page\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
  await db.run(sql`CREATE TABLE \`not_found_page_locales\` (
  	\`title\` text NOT NULL,
  	\`description\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`not_found_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`not_found_page_locales_locale_parent_id_unique\` ON \`not_found_page_locales\` (\`_locale\`,\`_parent_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`users_sessions\`;`)
  await db.run(sql`DROP TABLE \`users\`;`)
  await db.run(sql`DROP TABLE \`media\`;`)
  await db.run(sql`DROP TABLE \`media_locales\`;`)
  await db.run(sql`DROP TABLE \`categories\`;`)
  await db.run(sql`DROP TABLE \`categories_locales\`;`)
  await db.run(sql`DROP TABLE \`artisans\`;`)
  await db.run(sql`DROP TABLE \`artisans_locales\`;`)
  await db.run(sql`DROP TABLE \`products_gallery\`;`)
  await db.run(sql`DROP TABLE \`products_story\`;`)
  await db.run(sql`DROP TABLE \`products_badges\`;`)
  await db.run(sql`DROP TABLE \`products_main_herbs\`;`)
  await db.run(sql`DROP TABLE \`products_usage\`;`)
  await db.run(sql`DROP TABLE \`products_care_instructions\`;`)
  await db.run(sql`DROP TABLE \`products\`;`)
  await db.run(sql`DROP TABLE \`products_locales\`;`)
  await db.run(sql`DROP TABLE \`_products_v_version_gallery\`;`)
  await db.run(sql`DROP TABLE \`_products_v_version_story\`;`)
  await db.run(sql`DROP TABLE \`_products_v_version_badges\`;`)
  await db.run(sql`DROP TABLE \`_products_v_version_main_herbs\`;`)
  await db.run(sql`DROP TABLE \`_products_v_version_usage\`;`)
  await db.run(sql`DROP TABLE \`_products_v_version_care_instructions\`;`)
  await db.run(sql`DROP TABLE \`_products_v\`;`)
  await db.run(sql`DROP TABLE \`_products_v_locales\`;`)
  await db.run(sql`DROP TABLE \`articles_blocks_heading\`;`)
  await db.run(sql`DROP TABLE \`articles_blocks_heading_locales\`;`)
  await db.run(sql`DROP TABLE \`articles_blocks_paragraph\`;`)
  await db.run(sql`DROP TABLE \`articles_blocks_paragraph_locales\`;`)
  await db.run(sql`DROP TABLE \`articles_blocks_list_items\`;`)
  await db.run(sql`DROP TABLE \`articles_blocks_list\`;`)
  await db.run(sql`DROP TABLE \`articles_blocks_image\`;`)
  await db.run(sql`DROP TABLE \`articles_blocks_quote\`;`)
  await db.run(sql`DROP TABLE \`articles_blocks_quote_locales\`;`)
  await db.run(sql`DROP TABLE \`articles_blocks_youtube\`;`)
  await db.run(sql`DROP TABLE \`articles_blocks_youtube_locales\`;`)
  await db.run(sql`DROP TABLE \`articles\`;`)
  await db.run(sql`DROP TABLE \`articles_locales\`;`)
  await db.run(sql`DROP TABLE \`_articles_v_blocks_heading\`;`)
  await db.run(sql`DROP TABLE \`_articles_v_blocks_heading_locales\`;`)
  await db.run(sql`DROP TABLE \`_articles_v_blocks_paragraph\`;`)
  await db.run(sql`DROP TABLE \`_articles_v_blocks_paragraph_locales\`;`)
  await db.run(sql`DROP TABLE \`_articles_v_blocks_list_items\`;`)
  await db.run(sql`DROP TABLE \`_articles_v_blocks_list\`;`)
  await db.run(sql`DROP TABLE \`_articles_v_blocks_image\`;`)
  await db.run(sql`DROP TABLE \`_articles_v_blocks_quote\`;`)
  await db.run(sql`DROP TABLE \`_articles_v_blocks_quote_locales\`;`)
  await db.run(sql`DROP TABLE \`_articles_v_blocks_youtube\`;`)
  await db.run(sql`DROP TABLE \`_articles_v_blocks_youtube_locales\`;`)
  await db.run(sql`DROP TABLE \`_articles_v\`;`)
  await db.run(sql`DROP TABLE \`_articles_v_locales\`;`)
  await db.run(sql`DROP TABLE \`workshops_description\`;`)
  await db.run(sql`DROP TABLE \`workshops_booking_notes\`;`)
  await db.run(sql`DROP TABLE \`workshops\`;`)
  await db.run(sql`DROP TABLE \`workshops_locales\`;`)
  await db.run(sql`DROP TABLE \`places\`;`)
  await db.run(sql`DROP TABLE \`places_locales\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_heading\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_heading_locales\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_paragraph\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_paragraph_locales\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_list_items\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_list\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_prose\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_image_text\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_image_text_locales\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_cards_items\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_cards_items_locales\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_cards\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_cards_locales\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_stats_items\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_stats_items_locales\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_stats\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_stats_locales\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_gallery_images\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_gallery\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_gallery_locales\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_collection\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_collection_locales\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_cta\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_cta_locales\`;`)
  await db.run(sql`DROP TABLE \`pages\`;`)
  await db.run(sql`DROP TABLE \`pages_locales\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_heading\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_heading_locales\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_paragraph\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_paragraph_locales\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_list_items\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_list\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_prose\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_image_text\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_image_text_locales\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_cards_items\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_cards_items_locales\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_cards\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_cards_locales\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_stats_items\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_stats_items_locales\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_stats\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_stats_locales\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_gallery_images\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_gallery\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_gallery_locales\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_collection\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_collection_locales\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_cta\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_cta_locales\`;`)
  await db.run(sql`DROP TABLE \`_pages_v\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_locales\`;`)
  await db.run(sql`DROP TABLE \`enquiries\`;`)
  await db.run(sql`DROP TABLE \`redirects\`;`)
  await db.run(sql`DROP TABLE \`payload_kv\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_preferences\`;`)
  await db.run(sql`DROP TABLE \`payload_preferences_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_migrations\`;`)
  await db.run(sql`DROP TABLE \`site_settings\`;`)
  await db.run(sql`DROP TABLE \`site_settings_locales\`;`)
  await db.run(sql`DROP TABLE \`_site_settings_v\`;`)
  await db.run(sql`DROP TABLE \`_site_settings_v_locales\`;`)
  await db.run(sql`DROP TABLE \`navigation_main_menu_children\`;`)
  await db.run(sql`DROP TABLE \`navigation_main_menu_children_locales\`;`)
  await db.run(sql`DROP TABLE \`navigation_main_menu\`;`)
  await db.run(sql`DROP TABLE \`navigation_main_menu_locales\`;`)
  await db.run(sql`DROP TABLE \`navigation_footer_columns_links\`;`)
  await db.run(sql`DROP TABLE \`navigation_footer_columns_links_locales\`;`)
  await db.run(sql`DROP TABLE \`navigation_footer_columns\`;`)
  await db.run(sql`DROP TABLE \`navigation_footer_columns_locales\`;`)
  await db.run(sql`DROP TABLE \`navigation\`;`)
  await db.run(sql`DROP TABLE \`navigation_locales\`;`)
  await db.run(sql`DROP TABLE \`_navigation_v_version_main_menu_children\`;`)
  await db.run(sql`DROP TABLE \`_navigation_v_version_main_menu_children_locales\`;`)
  await db.run(sql`DROP TABLE \`_navigation_v_version_main_menu\`;`)
  await db.run(sql`DROP TABLE \`_navigation_v_version_main_menu_locales\`;`)
  await db.run(sql`DROP TABLE \`_navigation_v_version_footer_columns_links\`;`)
  await db.run(sql`DROP TABLE \`_navigation_v_version_footer_columns_links_locales\`;`)
  await db.run(sql`DROP TABLE \`_navigation_v_version_footer_columns\`;`)
  await db.run(sql`DROP TABLE \`_navigation_v_version_footer_columns_locales\`;`)
  await db.run(sql`DROP TABLE \`_navigation_v\`;`)
  await db.run(sql`DROP TABLE \`_navigation_v_locales\`;`)
  await db.run(sql`DROP TABLE \`theme\`;`)
  await db.run(sql`DROP TABLE \`_theme_v\`;`)
  await db.run(sql`DROP TABLE \`ui_labels\`;`)
  await db.run(sql`DROP TABLE \`ui_labels_locales\`;`)
  await db.run(sql`DROP TABLE \`_ui_labels_v\`;`)
  await db.run(sql`DROP TABLE \`_ui_labels_v_locales\`;`)
  await db.run(sql`DROP TABLE \`seo_settings_keywords\`;`)
  await db.run(sql`DROP TABLE \`seo_settings\`;`)
  await db.run(sql`DROP TABLE \`home_page_hero_title_lines\`;`)
  await db.run(sql`DROP TABLE \`home_page_hero_stats\`;`)
  await db.run(sql`DROP TABLE \`home_page_hero_stats_locales\`;`)
  await db.run(sql`DROP TABLE \`home_page_highlights\`;`)
  await db.run(sql`DROP TABLE \`home_page_highlights_locales\`;`)
  await db.run(sql`DROP TABLE \`home_page_sections\`;`)
  await db.run(sql`DROP TABLE \`home_page\`;`)
  await db.run(sql`DROP TABLE \`home_page_locales\`;`)
  await db.run(sql`DROP TABLE \`_home_page_v_version_hero_title_lines\`;`)
  await db.run(sql`DROP TABLE \`_home_page_v_version_hero_stats\`;`)
  await db.run(sql`DROP TABLE \`_home_page_v_version_hero_stats_locales\`;`)
  await db.run(sql`DROP TABLE \`_home_page_v_version_highlights\`;`)
  await db.run(sql`DROP TABLE \`_home_page_v_version_highlights_locales\`;`)
  await db.run(sql`DROP TABLE \`_home_page_v_version_sections\`;`)
  await db.run(sql`DROP TABLE \`_home_page_v\`;`)
  await db.run(sql`DROP TABLE \`_home_page_v_locales\`;`)
  await db.run(sql`DROP TABLE \`about_page_sections\`;`)
  await db.run(sql`DROP TABLE \`about_page_blocks_heading\`;`)
  await db.run(sql`DROP TABLE \`about_page_blocks_heading_locales\`;`)
  await db.run(sql`DROP TABLE \`about_page_blocks_paragraph\`;`)
  await db.run(sql`DROP TABLE \`about_page_blocks_paragraph_locales\`;`)
  await db.run(sql`DROP TABLE \`about_page_facts\`;`)
  await db.run(sql`DROP TABLE \`about_page_facts_locales\`;`)
  await db.run(sql`DROP TABLE \`about_page_assets\`;`)
  await db.run(sql`DROP TABLE \`about_page_assets_locales\`;`)
  await db.run(sql`DROP TABLE \`about_page_references\`;`)
  await db.run(sql`DROP TABLE \`about_page\`;`)
  await db.run(sql`DROP TABLE \`about_page_locales\`;`)
  await db.run(sql`DROP TABLE \`_about_page_v_version_sections\`;`)
  await db.run(sql`DROP TABLE \`_about_page_v_blocks_heading\`;`)
  await db.run(sql`DROP TABLE \`_about_page_v_blocks_heading_locales\`;`)
  await db.run(sql`DROP TABLE \`_about_page_v_blocks_paragraph\`;`)
  await db.run(sql`DROP TABLE \`_about_page_v_blocks_paragraph_locales\`;`)
  await db.run(sql`DROP TABLE \`_about_page_v_version_facts\`;`)
  await db.run(sql`DROP TABLE \`_about_page_v_version_facts_locales\`;`)
  await db.run(sql`DROP TABLE \`_about_page_v_version_assets\`;`)
  await db.run(sql`DROP TABLE \`_about_page_v_version_assets_locales\`;`)
  await db.run(sql`DROP TABLE \`_about_page_v_version_references\`;`)
  await db.run(sql`DROP TABLE \`_about_page_v\`;`)
  await db.run(sql`DROP TABLE \`_about_page_v_locales\`;`)
  await db.run(sql`DROP TABLE \`shop_page_sections\`;`)
  await db.run(sql`DROP TABLE \`shop_page\`;`)
  await db.run(sql`DROP TABLE \`shop_page_locales\`;`)
  await db.run(sql`DROP TABLE \`_shop_page_v_version_sections\`;`)
  await db.run(sql`DROP TABLE \`_shop_page_v\`;`)
  await db.run(sql`DROP TABLE \`_shop_page_v_locales\`;`)
  await db.run(sql`DROP TABLE \`stories_page_sections\`;`)
  await db.run(sql`DROP TABLE \`stories_page\`;`)
  await db.run(sql`DROP TABLE \`stories_page_locales\`;`)
  await db.run(sql`DROP TABLE \`_stories_page_v_version_sections\`;`)
  await db.run(sql`DROP TABLE \`_stories_page_v\`;`)
  await db.run(sql`DROP TABLE \`_stories_page_v_locales\`;`)
  await db.run(sql`DROP TABLE \`tourism_page_sections\`;`)
  await db.run(sql`DROP TABLE \`tourism_page_travel_options\`;`)
  await db.run(sql`DROP TABLE \`tourism_page_travel_options_locales\`;`)
  await db.run(sql`DROP TABLE \`tourism_page\`;`)
  await db.run(sql`DROP TABLE \`tourism_page_locales\`;`)
  await db.run(sql`DROP TABLE \`_tourism_page_v_version_sections\`;`)
  await db.run(sql`DROP TABLE \`_tourism_page_v_version_travel_options\`;`)
  await db.run(sql`DROP TABLE \`_tourism_page_v_version_travel_options_locales\`;`)
  await db.run(sql`DROP TABLE \`_tourism_page_v\`;`)
  await db.run(sql`DROP TABLE \`_tourism_page_v_locales\`;`)
  await db.run(sql`DROP TABLE \`contact_page_sections\`;`)
  await db.run(sql`DROP TABLE \`contact_page_channels\`;`)
  await db.run(sql`DROP TABLE \`contact_page_channels_locales\`;`)
  await db.run(sql`DROP TABLE \`contact_page_form_topics\`;`)
  await db.run(sql`DROP TABLE \`contact_page\`;`)
  await db.run(sql`DROP TABLE \`contact_page_locales\`;`)
  await db.run(sql`DROP TABLE \`_contact_page_v_version_sections\`;`)
  await db.run(sql`DROP TABLE \`_contact_page_v_version_channels\`;`)
  await db.run(sql`DROP TABLE \`_contact_page_v_version_channels_locales\`;`)
  await db.run(sql`DROP TABLE \`_contact_page_v_version_form_topics\`;`)
  await db.run(sql`DROP TABLE \`_contact_page_v\`;`)
  await db.run(sql`DROP TABLE \`_contact_page_v_locales\`;`)
  await db.run(sql`DROP TABLE \`not_found_page_buttons\`;`)
  await db.run(sql`DROP TABLE \`not_found_page_buttons_locales\`;`)
  await db.run(sql`DROP TABLE \`not_found_page\`;`)
  await db.run(sql`DROP TABLE \`not_found_page_locales\`;`)
}
