import Link from "next/link";
import type { Certificate } from "@prisma/client";
import { daysUntilExpiry, formatNoticePeriod } from "@/lib/notice";

function fmtDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

type Props = {
  certificates: Certificate[];
  showNoticeColumn?: boolean;
};

export function CertificateTable({ certificates, showNoticeColumn }: Props) {
  if (certificates.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50/80 px-6 py-12 text-center text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900/40 dark:text-zinc-400">
        No certificates to show.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-zinc-200 bg-zinc-50/80 text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-400">
          <tr>
            <th className="px-4 py-3">System</th>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Owner</th>
            <th className="px-4 py-3">Expires</th>
            <th className="px-4 py-3">Days left</th>
            {showNoticeColumn ? <th className="px-4 py-3">Notice window</th> : null}
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {certificates.map((c) => {
            const days = daysUntilExpiry(c.endDate);
            const expired = days < 0;
            const urgent = !expired && days <= 7;
            return (
              <tr key={c.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-900/40">
                <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">{c.system}</td>
                <td className="px-4 py-3 text-zinc-800 dark:text-zinc-200">{c.name}</td>
                <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">
                  <div>{c.ownerName}</div>
                  <div className="text-xs text-zinc-500">{c.ownerEmail}</div>
                </td>
                <td className="px-4 py-3 tabular-nums text-zinc-700 dark:text-zinc-300">{fmtDate(c.endDate)}</td>
                <td className="px-4 py-3">
                  <span
                    className={
                      expired
                        ? "inline-flex rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-900 dark:bg-red-950/60 dark:text-red-200"
                        : urgent
                          ? "inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-900 dark:bg-amber-950/60 dark:text-amber-200"
                          : "tabular-nums text-zinc-700 dark:text-zinc-300"
                    }
                  >
                    {expired ? "Expired" : days}
                  </span>
                </td>
                {showNoticeColumn ? (
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                    {formatNoticePeriod(c.noticeQuantity, c.noticeUnit)} before expiry
                  </td>
                ) : null}
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/certificates/${c.id}/edit`}
                    className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
