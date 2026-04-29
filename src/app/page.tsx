import Link from "next/link";
import { getCertificatesInNoticeWindow } from "@/lib/dashboard-in-window";
import { CertificateTable } from "@/components/CertificateTable";
import { NoticeTypeSummary } from "@/components/NoticeTypeSummary";

export const dynamic = "force-dynamic";

export default async function NoticeDashboardPage() {
  const inWindow = await getCertificatesInNoticeWindow();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">Notice dashboard</h1>
          <p className="mt-2 max-w-2xl text-zinc-600 dark:text-zinc-400">
            Tracked objects currently inside their configured notice window before expiry or renewal. Schedule the notify
            cron daily: each row gets at most one reminder per UTC day while it stays in the window, and the notification
            count on each record increases with every successful send.
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
          <a
            href="/api/dashboard/export"
            className="inline-flex items-center justify-center rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-800 shadow-sm hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
          >
            Download Excel
          </a>
          <Link
            href="/certificates/new"
            className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-500"
          >
            Add object
          </Link>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <span className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-900 dark:bg-indigo-950/80 dark:text-indigo-100">
          {inWindow.length} in notice period
        </span>
        <Link href="/certificates" className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
          View all tracked objects →
        </Link>
      </div>

      <NoticeTypeSummary certificates={inWindow} />

      <CertificateTable certificates={inWindow} showNoticeColumn showNotificationCountColumn />
    </div>
  );
}
