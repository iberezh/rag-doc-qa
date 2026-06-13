/*
  Warnings:

  - Added the required column `bot_id` to the `documents` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "documents" ADD COLUMN     "bot_id" UUID NOT NULL;

-- CreateTable
CREATE TABLE "bots" (
    "id" UUID NOT NULL,
    "account_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "public_key" TEXT NOT NULL,
    "allowed_domains" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "greeting" TEXT NOT NULL DEFAULT 'Hi! Ask me anything about our docs.',
    "color" TEXT NOT NULL DEFAULT '#c0492c',
    "show_badge" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "bots_public_key_key" ON "bots"("public_key");

-- CreateIndex
CREATE INDEX "bots_account_id_idx" ON "bots"("account_id");

-- CreateIndex
CREATE INDEX "documents_bot_id_idx" ON "documents"("bot_id");

-- AddForeignKey
ALTER TABLE "bots" ADD CONSTRAINT "bots_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_bot_id_fkey" FOREIGN KEY ("bot_id") REFERENCES "bots"("id") ON DELETE CASCADE ON UPDATE CASCADE;
