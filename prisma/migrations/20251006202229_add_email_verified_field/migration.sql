/*
  Warnings:

  - You are about to drop the `verification_codes` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."verification_codes" DROP CONSTRAINT "verification_codes_user_id_fkey";

-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "is_email_verified" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "public"."verification_codes";
