import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`site_settings\` ADD \`favicon_id\` integer REFERENCES media(id) ON UPDATE no action ON DELETE set null;`)
  await db.run(sql`CREATE INDEX \`site_settings_favicon_idx\` ON \`site_settings\` (\`favicon_id\`);`)
  await db.run(sql`ALTER TABLE \`_site_settings_v\` ADD \`version_favicon_id\` integer REFERENCES media(id) ON UPDATE no action ON DELETE set null;`)
  await db.run(sql`CREATE INDEX \`_site_settings_v_version_version_favicon_idx\` ON \`_site_settings_v\` (\`version_favicon_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_site_settings\` (
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
  await db.run(sql`INSERT INTO \`__new_site_settings\`("id", "logo_id", "phone", "phone_display", "line_id", "line_url", "facebook_url", "email", "address_locality", "address_region", "postal_code", "map_latitude", "map_longitude", "_status", "updated_at", "created_at") SELECT "id", "logo_id", "phone", "phone_display", "line_id", "line_url", "facebook_url", "email", "address_locality", "address_region", "postal_code", "map_latitude", "map_longitude", "_status", "updated_at", "created_at" FROM \`site_settings\`;`)
  await db.run(sql`DROP TABLE \`site_settings\`;`)
  await db.run(sql`ALTER TABLE \`__new_site_settings\` RENAME TO \`site_settings\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`site_settings_logo_idx\` ON \`site_settings\` (\`logo_id\`);`)
  await db.run(sql`CREATE INDEX \`site_settings__status_idx\` ON \`site_settings\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`__new__site_settings_v\` (
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
  await db.run(sql`INSERT INTO \`__new__site_settings_v\`("id", "version_logo_id", "version_phone", "version_phone_display", "version_line_id", "version_line_url", "version_facebook_url", "version_email", "version_address_locality", "version_address_region", "version_postal_code", "version_map_latitude", "version_map_longitude", "version__status", "version_updated_at", "version_created_at", "created_at", "updated_at", "snapshot", "published_locale", "latest") SELECT "id", "version_logo_id", "version_phone", "version_phone_display", "version_line_id", "version_line_url", "version_facebook_url", "version_email", "version_address_locality", "version_address_region", "version_postal_code", "version_map_latitude", "version_map_longitude", "version__status", "version_updated_at", "version_created_at", "created_at", "updated_at", "snapshot", "published_locale", "latest" FROM \`_site_settings_v\`;`)
  await db.run(sql`DROP TABLE \`_site_settings_v\`;`)
  await db.run(sql`ALTER TABLE \`__new__site_settings_v\` RENAME TO \`_site_settings_v\`;`)
  await db.run(sql`CREATE INDEX \`_site_settings_v_version_version_logo_idx\` ON \`_site_settings_v\` (\`version_logo_id\`);`)
  await db.run(sql`CREATE INDEX \`_site_settings_v_version_version__status_idx\` ON \`_site_settings_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_site_settings_v_created_at_idx\` ON \`_site_settings_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_site_settings_v_updated_at_idx\` ON \`_site_settings_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_site_settings_v_snapshot_idx\` ON \`_site_settings_v\` (\`snapshot\`);`)
  await db.run(sql`CREATE INDEX \`_site_settings_v_published_locale_idx\` ON \`_site_settings_v\` (\`published_locale\`);`)
  await db.run(sql`CREATE INDEX \`_site_settings_v_latest_idx\` ON \`_site_settings_v\` (\`latest\`);`)
}
