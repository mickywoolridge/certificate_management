import type { Certificate } from "@prisma/client";

type Cert = Certificate & { objectType: { name: string } };

type Props = {
  certificates: Cert[];
};

export function NoticeTypeSummary({ certificates }: Props) {
  if (certificates.length === 0) {
    return null;
  }

  const groups = new Map<string, { inNotice: number; notified: number }>();
  for (const c of certificates) {
    const name = c.objectType.name;
    const g = groups.get(name) ?? { inNotice: 0, notified: 0 };
    g.inNotice += 1;
    if (c.noticeEntryNotifiedAt) g.notified += 1;
    groups.set(name, g);
  }

  const entries = Array.from(groups.entries()).sort((a, b) => a[0].localeCompare(b[0]));

  return (
    <div className="mb-6">
      <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">By object type</h2>
      <ul className="flex flex-wrap gap-2">
        {entries.map(([name, { inNotice, notified }]) => (
          <li
            key={name}
            className="inline-flex flex-wrap items-center gap-x-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 shadow-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          >
            <span className="font-medium text-zinc-900 dark:text-zinc-50">{name}</span>
            <span className="text-zinc-600 dark:text-zinc-400">
              {inNotice} in notice
              <span className="text-zinc-400 dark:text-zinc-500"> · </span>
              {notified} notified
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
