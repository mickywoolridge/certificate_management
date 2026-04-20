import { prisma } from "@/lib/prisma";
import { ObjectTypeManager } from "@/components/ObjectTypeManager";

export const dynamic = "force-dynamic";

export default async function ObjectTypesPage() {
  const objectTypes = await prisma.objectType.findMany({
    orderBy: [{ isActive: "desc" }, { name: "asc" }],
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="mb-2 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">Object types</h1>
      <p className="mb-8 text-zinc-600 dark:text-zinc-400">
        Configure which object categories can be tracked, such as SSL certificates, VPN access, and contracts.
      </p>
      <ObjectTypeManager objectTypes={objectTypes} />
    </div>
  );
}
