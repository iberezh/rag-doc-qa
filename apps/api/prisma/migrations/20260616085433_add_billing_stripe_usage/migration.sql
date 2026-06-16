-- AlterTable
ALTER TABLE "accounts" ADD COLUMN     "stripe_customer_id" TEXT;

-- CreateTable
CREATE TABLE "usage_counters" (
    "id" UUID NOT NULL,
    "account_id" UUID NOT NULL,
    "period" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usage_counters_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usage_counters_account_id_period_key" ON "usage_counters"("account_id", "period");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_stripe_customer_id_key" ON "accounts"("stripe_customer_id");

-- AddForeignKey
ALTER TABLE "usage_counters" ADD CONSTRAINT "usage_counters_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

