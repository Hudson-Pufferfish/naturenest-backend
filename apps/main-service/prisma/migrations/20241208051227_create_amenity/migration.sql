/*
  Warnings:

  - Added the required column `description` to the `amenity` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "amenity" ADD COLUMN     "description" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "_PropertyToAmenity" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_PropertyToAmenity_AB_unique" ON "_PropertyToAmenity"("A", "B");

-- CreateIndex
CREATE INDEX "_PropertyToAmenity_B_index" ON "_PropertyToAmenity"("B");

-- AddForeignKey
ALTER TABLE "_PropertyToAmenity" ADD CONSTRAINT "_PropertyToAmenity_A_fkey" FOREIGN KEY ("A") REFERENCES "amenity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PropertyToAmenity" ADD CONSTRAINT "_PropertyToAmenity_B_fkey" FOREIGN KEY ("B") REFERENCES "property"("id") ON DELETE CASCADE ON UPDATE CASCADE;
