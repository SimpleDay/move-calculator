import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_tenant_memberships_role" AS ENUM('owner', 'admin', 'estimator');
  CREATE TYPE "public"."enum_quotes_status" AS ENUM('draft', 'calculated', 'confirmationRequested', 'companyConfirmed', 'companyChanged');
  CREATE TYPE "public"."enum_quote_revisions_reason" AS ENUM('initial', 'customerChange', 'companyChange');
  CREATE TABLE "tenants" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"slug" varchar NOT NULL,
  	"name" varchar NOT NULL,
  	"branding_accent_color" varchar NOT NULL,
  	"branding_initials" varchar NOT NULL,
  	"branding_promise" varchar NOT NULL,
  	"phone_required" boolean DEFAULT true NOT NULL,
  	"pricing_draft" jsonb NOT NULL,
  	"services_draft" jsonb NOT NULL,
  	"active_pricing_profile_id" uuid,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "tenant_memberships" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"tenant_id" uuid NOT NULL,
  	"user_id" uuid NOT NULL,
  	"role" "enum_tenant_memberships_role" DEFAULT 'estimator' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "pricing_profiles" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"tenant_id" uuid NOT NULL,
  	"label" varchar NOT NULL,
  	"version" numeric NOT NULL,
  	"settings" jsonb NOT NULL,
  	"services" jsonb NOT NULL,
  	"published_at" timestamp(3) with time zone NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "quotes" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"tenant_id" uuid NOT NULL,
  	"status" "enum_quotes_status" DEFAULT 'draft' NOT NULL,
  	"access_token_hash" varchar NOT NULL,
  	"customer_name" varchar NOT NULL,
  	"contact" jsonb NOT NULL,
  	"move_snapshot" jsonb NOT NULL,
  	"current_revision_id" uuid,
  	"confirmed_revision_id" uuid,
  	"confirmation_requested_at" timestamp(3) with time zone,
  	"company_confirmed_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "quote_revisions" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"tenant_id" uuid NOT NULL,
  	"quote_id" uuid NOT NULL,
  	"revision" numeric NOT NULL,
  	"reason" "enum_quote_revisions_reason" NOT NULL,
  	"pricing_profile_id" uuid NOT NULL,
  	"input_snapshot" jsonb NOT NULL,
  	"calculation_snapshot" jsonb NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "tenants_id" uuid;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "tenant_memberships_id" uuid;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "pricing_profiles_id" uuid;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "quotes_id" uuid;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "quote_revisions_id" uuid;
  ALTER TABLE "tenants" ADD CONSTRAINT "tenants_active_pricing_profile_id_pricing_profiles_id_fk" FOREIGN KEY ("active_pricing_profile_id") REFERENCES "public"."pricing_profiles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "tenant_memberships" ADD CONSTRAINT "tenant_memberships_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "tenant_memberships" ADD CONSTRAINT "tenant_memberships_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pricing_profiles" ADD CONSTRAINT "pricing_profiles_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "quotes" ADD CONSTRAINT "quotes_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "quotes" ADD CONSTRAINT "quotes_current_revision_id_quote_revisions_id_fk" FOREIGN KEY ("current_revision_id") REFERENCES "public"."quote_revisions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "quotes" ADD CONSTRAINT "quotes_confirmed_revision_id_quote_revisions_id_fk" FOREIGN KEY ("confirmed_revision_id") REFERENCES "public"."quote_revisions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "quote_revisions" ADD CONSTRAINT "quote_revisions_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "quote_revisions" ADD CONSTRAINT "quote_revisions_quote_id_quotes_id_fk" FOREIGN KEY ("quote_id") REFERENCES "public"."quotes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "quote_revisions" ADD CONSTRAINT "quote_revisions_pricing_profile_id_pricing_profiles_id_fk" FOREIGN KEY ("pricing_profile_id") REFERENCES "public"."pricing_profiles"("id") ON DELETE set null ON UPDATE no action;
  CREATE UNIQUE INDEX "tenants_slug_idx" ON "tenants" USING btree ("slug");
  CREATE INDEX "tenants_active_pricing_profile_idx" ON "tenants" USING btree ("active_pricing_profile_id");
  CREATE INDEX "tenants_updated_at_idx" ON "tenants" USING btree ("updated_at");
  CREATE INDEX "tenants_created_at_idx" ON "tenants" USING btree ("created_at");
  CREATE INDEX "tenant_memberships_tenant_idx" ON "tenant_memberships" USING btree ("tenant_id");
  CREATE INDEX "tenant_memberships_user_idx" ON "tenant_memberships" USING btree ("user_id");
  CREATE INDEX "tenant_memberships_updated_at_idx" ON "tenant_memberships" USING btree ("updated_at");
  CREATE INDEX "tenant_memberships_created_at_idx" ON "tenant_memberships" USING btree ("created_at");
  CREATE INDEX "pricing_profiles_tenant_idx" ON "pricing_profiles" USING btree ("tenant_id");
  CREATE INDEX "pricing_profiles_version_idx" ON "pricing_profiles" USING btree ("version");
  CREATE INDEX "pricing_profiles_published_at_idx" ON "pricing_profiles" USING btree ("published_at");
  CREATE INDEX "pricing_profiles_updated_at_idx" ON "pricing_profiles" USING btree ("updated_at");
  CREATE INDEX "pricing_profiles_created_at_idx" ON "pricing_profiles" USING btree ("created_at");
  CREATE INDEX "quotes_tenant_idx" ON "quotes" USING btree ("tenant_id");
  CREATE INDEX "quotes_status_idx" ON "quotes" USING btree ("status");
  CREATE UNIQUE INDEX "quotes_access_token_hash_idx" ON "quotes" USING btree ("access_token_hash");
  CREATE INDEX "quotes_current_revision_idx" ON "quotes" USING btree ("current_revision_id");
  CREATE INDEX "quotes_confirmed_revision_idx" ON "quotes" USING btree ("confirmed_revision_id");
  CREATE INDEX "quotes_updated_at_idx" ON "quotes" USING btree ("updated_at");
  CREATE INDEX "quotes_created_at_idx" ON "quotes" USING btree ("created_at");
  CREATE INDEX "quote_revisions_tenant_idx" ON "quote_revisions" USING btree ("tenant_id");
  CREATE INDEX "quote_revisions_quote_idx" ON "quote_revisions" USING btree ("quote_id");
  CREATE INDEX "quote_revisions_revision_idx" ON "quote_revisions" USING btree ("revision");
  CREATE INDEX "quote_revisions_pricing_profile_idx" ON "quote_revisions" USING btree ("pricing_profile_id");
  CREATE INDEX "quote_revisions_updated_at_idx" ON "quote_revisions" USING btree ("updated_at");
  CREATE INDEX "quote_revisions_created_at_idx" ON "quote_revisions" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_tenants_fk" FOREIGN KEY ("tenants_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_tenant_memberships_fk" FOREIGN KEY ("tenant_memberships_id") REFERENCES "public"."tenant_memberships"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pricing_profiles_fk" FOREIGN KEY ("pricing_profiles_id") REFERENCES "public"."pricing_profiles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_quotes_fk" FOREIGN KEY ("quotes_id") REFERENCES "public"."quotes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_quote_revisions_fk" FOREIGN KEY ("quote_revisions_id") REFERENCES "public"."quote_revisions"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_tenants_id_idx" ON "payload_locked_documents_rels" USING btree ("tenants_id");
  CREATE INDEX "payload_locked_documents_rels_tenant_memberships_id_idx" ON "payload_locked_documents_rels" USING btree ("tenant_memberships_id");
  CREATE INDEX "payload_locked_documents_rels_pricing_profiles_id_idx" ON "payload_locked_documents_rels" USING btree ("pricing_profiles_id");
  CREATE INDEX "payload_locked_documents_rels_quotes_id_idx" ON "payload_locked_documents_rels" USING btree ("quotes_id");
  CREATE INDEX "payload_locked_documents_rels_quote_revisions_id_idx" ON "payload_locked_documents_rels" USING btree ("quote_revisions_id");`)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "tenants" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "tenant_memberships" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pricing_profiles" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "quotes" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "quote_revisions" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "tenants" CASCADE;
  DROP TABLE "tenant_memberships" CASCADE;
  DROP TABLE "pricing_profiles" CASCADE;
  DROP TABLE "quotes" CASCADE;
  DROP TABLE "quote_revisions" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_tenants_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_tenant_memberships_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_pricing_profiles_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_quotes_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_quote_revisions_fk";
  
  DROP INDEX "payload_locked_documents_rels_tenants_id_idx";
  DROP INDEX "payload_locked_documents_rels_tenant_memberships_id_idx";
  DROP INDEX "payload_locked_documents_rels_pricing_profiles_id_idx";
  DROP INDEX "payload_locked_documents_rels_quotes_id_idx";
  DROP INDEX "payload_locked_documents_rels_quote_revisions_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "tenants_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "tenant_memberships_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "pricing_profiles_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "quotes_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "quote_revisions_id";
  DROP TYPE "public"."enum_tenant_memberships_role";
  DROP TYPE "public"."enum_quotes_status";
  DROP TYPE "public"."enum_quote_revisions_reason";`)
}
