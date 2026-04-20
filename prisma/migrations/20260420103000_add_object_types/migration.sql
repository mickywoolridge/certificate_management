-- CreateTable
CREATE TABLE "ObjectType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ObjectType_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ObjectType_name_key" ON "ObjectType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ObjectType_slug_key" ON "ObjectType"("slug");

-- CreateIndex
CREATE INDEX "ObjectType_isActive_idx" ON "ObjectType"("isActive");

-- Seed defaults for standard tracked object categories
INSERT INTO "ObjectType" ("id", "name", "slug", "isActive", "updatedAt")
VALUES
  ('11111111-1111-1111-1111-111111111111', 'SSL certificate', 'ssl-certificate', true, CURRENT_TIMESTAMP),
  ('22222222-2222-2222-2222-222222222222', '3rd-party VPN access', '3rd-party-vpn-access', true, CURRENT_TIMESTAMP),
  ('33333333-3333-3333-3333-333333333333', 'ISP contract', 'isp-contract', true, CURRENT_TIMESTAMP);

-- AddColumn
ALTER TABLE "Certificate" ADD COLUMN "objectTypeId" TEXT;

-- Backfill existing rows to SSL certificate
UPDATE "Certificate"
SET "objectTypeId" = '11111111-1111-1111-1111-111111111111'
WHERE "objectTypeId" IS NULL;

-- Set NOT NULL after backfill
ALTER TABLE "Certificate" ALTER COLUMN "objectTypeId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "Certificate_objectTypeId_idx" ON "Certificate"("objectTypeId");

-- AddForeignKey
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_objectTypeId_fkey" FOREIGN KEY ("objectTypeId") REFERENCES "ObjectType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
