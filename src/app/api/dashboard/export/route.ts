import { NextResponse } from "next/server";
import { getCertificatesInNoticeWindow } from "@/lib/dashboard-in-window";
import { buildNoticeDashboardXlsx } from "@/lib/notice-dashboard-xlsx";

export const dynamic = "force-dynamic";

function filenameDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function GET() {
  const rows = await getCertificatesInNoticeWindow();
  const buffer = await buildNoticeDashboardXlsx(rows);
  const name = `notice-dashboard-${filenameDate()}.xlsx`;

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${name}"`,
      "Cache-Control": "no-store",
    },
  });
}
