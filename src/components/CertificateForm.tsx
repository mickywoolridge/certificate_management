"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Certificate, NoticeUnit, ObjectType } from "@prisma/client";

const units: NoticeUnit[] = ["DAYS", "WEEKS", "MONTHS"];

/** RSC passes Prisma `Date` fields as ISO strings into client components. */
function toDateInput(value: Date | string): string {
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

type Props = {
  certificate?: Certificate;
  objectTypes: ObjectType[];
};

export function CertificateForm({ certificate, objectTypes }: Props) {
  const router = useRouter();
  const editing = Boolean(certificate);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const form = e.currentTarget;
    const fd = new FormData(form);

    const payload = {
      objectTypeId: String(fd.get("objectTypeId") ?? "").trim(),
      system: String(fd.get("system") ?? "").trim(),
      name: String(fd.get("name") ?? "").trim(),
      description: String(fd.get("description") ?? "").trim() || null,
      ownerName: String(fd.get("ownerName") ?? "").trim(),
      ownerEmail: String(fd.get("ownerEmail") ?? "").trim(),
      startDate: String(fd.get("startDate") ?? ""),
      endDate: String(fd.get("endDate") ?? ""),
      noticeQuantity: Number(fd.get("noticeQuantity")),
      noticeUnit: String(fd.get("noticeUnit") ?? "DAYS"),
    };

    try {
      const url = editing ? `/api/certificates/${certificate!.id}` : "/api/certificates";
      const res = await fetch(url, {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Request failed");
        setPending(false);
        return;
      }
      router.push("/certificates");
      router.refresh();
    } catch {
      setError("Network error");
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-2xl space-y-6">
      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">System</span>
          <input
            name="system"
            required
            defaultValue={certificate?.system}
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            placeholder="e.g. api.example.com"
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Object type</span>
          <select
            name="objectTypeId"
            required
            defaultValue={certificate?.objectTypeId ?? objectTypes[0]?.id ?? ""}
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          >
            {objectTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block sm:col-span-2">
          <span className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Item name</span>
          <input
            name="name"
            required
            defaultValue={certificate?.name}
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            placeholder="e.g. Wildcard *.example.com or annual renewal"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Valid from</span>
          <input
            name="startDate"
            type="date"
            required
            defaultValue={certificate ? toDateInput(certificate.startDate) : ""}
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Expires</span>
          <input
            name="endDate"
            type="date"
            required
            defaultValue={certificate ? toDateInput(certificate.endDate) : ""}
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Description</span>
          <textarea
            name="description"
            rows={3}
            defaultValue={certificate?.description ?? ""}
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            placeholder="Optional notes"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Owner name</span>
          <input
            name="ownerName"
            required
            defaultValue={certificate?.ownerName}
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Owner email</span>
          <input
            name="ownerEmail"
            type="email"
            required
            defaultValue={certificate?.ownerEmail}
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            placeholder="owner@company.com"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Notify this many before expiry</span>
          <input
            name="noticeQuantity"
            type="number"
            min={1}
            required
            defaultValue={certificate != null ? String(certificate.noticeQuantity) : "30"}
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Period</span>
          <select
            name="noticeUnit"
            defaultValue={certificate?.noticeUnit ?? "DAYS"}
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          >
            {units.map((u) => (
              <option key={u} value={u}>
                {u === "DAYS" ? "Days" : u === "WEEKS" ? "Weeks" : "Months"}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-500 disabled:opacity-60"
        >
          {pending ? "Saving..." : editing ? "Save changes" : "Create record"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
