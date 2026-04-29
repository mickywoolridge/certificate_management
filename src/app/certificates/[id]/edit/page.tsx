import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CertificateForm } from "@/components/CertificateForm";
import { CertificateDeleteButton } from "@/components/CertificateDeleteButton";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function EditCertificatePage({ params }: Props) {
  const { id } = await params;
  const [certificate, objectTypes] = await Promise.all([
    prisma.certificate.findUnique({ where: { id } }),
    prisma.objectType.findMany({
      orderBy: [{ isActive: "desc" }, { name: "asc" }],
    }),
  ]);
  if (!certificate) notFound();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">Edit tracked object</h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Updating expiry or notice settings resets the notification count and last-sent time so the daily cron can
            start fresh for the new window.
          </p>
        </div>
        <CertificateDeleteButton id={certificate.id} />
      </div>
      <CertificateForm certificate={certificate} objectTypes={objectTypes} />
    </div>
  );
}
