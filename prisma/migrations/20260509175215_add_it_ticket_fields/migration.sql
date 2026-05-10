-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN     "affectedSystem" TEXT,
ADD COLUMN     "category" TEXT,
ADD COLUMN     "errorMessage" TEXT,
ADD COLUMN     "softwareName" TEXT;
