import { CertificateForm } from "@/components/CertificateForm";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function NewCertificatePage() {
  const objectTypes = await prisma.objectType.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="mb-2 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">Add tracked object</h1>
      <p className="mb-8 text-zinc-600 dark:text-zinc-400">
        Record dates, owner contact, and how far ahead you want to be notified before expiry or renewal.
      </p>
      {objectTypes.length === 0 ? (
        <p className="rounded-xl border border-dashed border-amber-300 bg-amber-50/80 px-6 py-4 text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100">
          No active object types are configured. Add one in the Object types page first.
        </p>
      ) : (
        <CertificateForm objectTypes={objectTypes} />
      )}
    </div>
  );
}
