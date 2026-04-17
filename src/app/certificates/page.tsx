import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CertificateTable } from "@/components/CertificateTable";

export const dynamic = "force-dynamic";

export default async function CertificatesPage() {
  const certificates = await prisma.certificate.findMany({
    orderBy: { endDate: "asc" },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">All certificates</h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">Every tracked certificate, sorted by expiry.</p>
        </div>
        <Link
          href="/certificates/new"
          className="inline-flex shrink-0 items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-500"
        >
          Add certificate
        </Link>
      </div>

      <CertificateTable certificates={certificates} />
    </div>
  );
}
