import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_orders_payment_method" AS ENUM('gcash', 'cash');
  ALTER TABLE "orders" ADD COLUMN "customer_name" varchar;
  ALTER TABLE "orders" ADD COLUMN "grade_section" varchar;
  ALTER TABLE "orders" ADD COLUMN "payment_method" "enum_orders_payment_method" DEFAULT 'gcash';
  ALTER TABLE "orders" ADD COLUMN "payment_reference" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "orders" DROP COLUMN "customer_name";
  ALTER TABLE "orders" DROP COLUMN "grade_section";
  ALTER TABLE "orders" DROP COLUMN "payment_method";
  ALTER TABLE "orders" DROP COLUMN "payment_reference";
  DROP TYPE "public"."enum_orders_payment_method";`)
}
