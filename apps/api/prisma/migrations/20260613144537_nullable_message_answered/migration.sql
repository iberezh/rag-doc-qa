-- AlterTable
ALTER TABLE "messages" ALTER COLUMN "answered" DROP NOT NULL,
ALTER COLUMN "answered" DROP DEFAULT;
