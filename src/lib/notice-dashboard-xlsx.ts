import ExcelJS from "exceljs";
import type { Certificate } from "@prisma/client";
import { daysUntilExpiry, formatNoticePeriod } from "@/lib/notice";

export type NoticeDashboardRow = Certificate & { objectType: { name: string } };

export async function buildNoticeDashboardXlsx(rows: NoticeDashboardRow[]): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Expiry tracker";

  const detail = workbook.addWorksheet("In notice period", {
    views: [{ state: "frozen", ySplit: 1 }],
  });
  detail.columns = [
    { header: "Object type", key: "type", width: 28 },
    { header: "System", key: "system", width: 36 },
    { header: "Name", key: "name", width: 36 },
    { header: "Owner", key: "owner", width: 24 },
    { header: "Owner email", key: "email", width: 32 },
    { header: "End date", key: "endDate", width: 14 },
    { header: "Days left", key: "daysLeft", width: 12 },
    { header: "Notice window", key: "noticeWindow", width: 22 },
    { header: "Notification count", key: "count", width: 18 },
    { header: "Last notified (UTC)", key: "lastAt", width: 18 },
  ];

  for (const c of rows) {
    const days = daysUntilExpiry(c.endDate);
    detail.addRow({
      type: c.objectType.name,
      system: c.system,
      name: c.name,
      owner: c.ownerName,
      email: c.ownerEmail,
      endDate: c.endDate.toISOString().slice(0, 10),
      daysLeft: days < 0 ? "Expired" : String(days),
      noticeWindow: `${formatNoticePeriod(c.noticeQuantity, c.noticeUnit)} before end`,
      count: c.notificationCount,
      lastAt: c.lastNotifiedAt ? c.lastNotifiedAt.toISOString().slice(0, 10) : "",
    });
  }

  detail.getRow(1).font = { bold: true };

  const byType = new Map<string, { inNotice: number; notificationSum: number }>();
  for (const c of rows) {
    const name = c.objectType.name;
    const cur = byType.get(name) ?? { inNotice: 0, notificationSum: 0 };
    cur.inNotice += 1;
    cur.notificationSum += c.notificationCount;
    byType.set(name, cur);
  }

  const summary = workbook.addWorksheet("Summary by type");
  summary.columns = [
    { header: "Object type", key: "t", width: 32 },
    { header: "In notice period", key: "n", width: 18 },
    { header: "Total notifications", key: "r", width: 22 },
  ];
  summary.getRow(1).font = { bold: true };
  for (const [name, counts] of Array.from(byType.entries()).sort((a, b) => a[0].localeCompare(b[0]))) {
    summary.addRow({ t: name, n: counts.inNotice, r: counts.notificationSum });
  }

  const buf = await workbook.xlsx.writeBuffer();
  return Buffer.from(buf);
}
