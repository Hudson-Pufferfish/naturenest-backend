-- AlterTable
ALTER TABLE "property" ADD COLUMN     "totalIncome" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "totalNightsBooked" INTEGER DEFAULT 0;

-- AlterTable
ALTER TABLE "reservation" ADD COLUMN     "number_of_guests" INTEGER DEFAULT 1;
