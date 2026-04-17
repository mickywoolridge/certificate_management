import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { isInNoticePeriod } from "@/lib/notice";
import { CertificateTable } from "@/components/CertificateTable";

export const dynamic = "force-dynamic";

export default async function NoticeDashboardPage() {
  const all = await prisma.certificate.findMany({
    orderBy: { endDate: "asc" },
  });
  const now = new Date();
  const inWindow = all.filter((c) => isInNoticePeriod(c, now));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">Notice dashboard</h1>
          <p className="mt-2 max-w-2xl text-zinc-600 dark:text-zinc-400">
            Certificates currently inside their configured notice window before expiry. Owners are emailed once when a
            certificate first enters this window (via the scheduled notify job).
          </p>
        </div>
        <Link
          href="/certificates/new"
          className="inline-flex shrink-0 items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-500"
        >
          Add certificate
        </Link>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <span className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-900 dark:bg-indigo-950/80 dark:text-indigo-100">
          {inWindow.length} in notice period
        </span>
        <Link href="/certificates" className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
          View all certificates →
        </Link>
      </div>

      <CertificateTable certificates={inWindow} showNoticeColumn />
    </div>
  );
}
