import { CertificateForm } from "@/components/CertificateForm";

export default function NewCertificatePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="mb-2 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">Add certificate</h1>
      <p className="mb-8 text-zinc-600 dark:text-zinc-400">
        Record validity dates, owner contact, and how far ahead you want to be notified.
      </p>
      <CertificateForm />
    </div>
  );
}
