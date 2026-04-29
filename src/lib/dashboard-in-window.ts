import { prisma } from "@/lib/prisma";
import { isInNoticePeriod } from "@/lib/notice";

export async function getCertificatesInNoticeWindow() {
  const all = await prisma.certificate.findMany({
    include: { objectType: true },
    orderBy: { endDate: "asc" },
  });
  const now = new Date();
  return all.filter((c) => isInNoticePeriod(c, now));
}
