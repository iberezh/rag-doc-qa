-- Enable pgvector (required for the chunks.embedding column below)
CREATE EXTENSION IF NOT EXISTS vector;

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('PENDING', 'PROCESSING', 'READY', 'FAILED');

-- CreateTable
CREATE TABLE "documents" (
    "id" UUID NOT NULL,
    "filename" TEXT NOT NULL,
    "content_type" TEXT NOT NULL,
    "status" "DocumentStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chunks" (
    "id" UUID NOT NULL,
    "document_id" UUID NOT NULL,
    "chunk_index" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "embedding" vector(384),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chunks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "chunks_document_id_idx" ON "chunks"("document_id");

-- AddForeignKey
ALTER TABLE "chunks" ADD CONSTRAINT "chunks_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
