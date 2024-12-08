/*
  Warnings:

  - You are about to drop the `country` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "property" ADD COLUMN     "country_code" VARCHAR(2) NOT NULL DEFAULT 'US';

-- DropTable
DROP TABLE "country";
