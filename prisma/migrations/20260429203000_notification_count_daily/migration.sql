-- AlterTable: daily notification counter replaces single "entered window" timestamp
ALTER TABLE "Certificate" ADD COLUMN "notificationCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Certificate" ADD COLUMN "lastNotifiedAt" TIMESTAMP(3);

UPDATE "Certificate"
SET
  "notificationCount" = CASE WHEN "noticeEntryNotifiedAt" IS NOT NULL THEN 1 ELSE 0 END,
  "lastNotifiedAt" = "noticeEntryNotifiedAt";

ALTER TABLE "Certificate" DROP COLUMN "noticeEntryNotifiedAt";
