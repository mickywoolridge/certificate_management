export function normalizeObjectTypeName(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

export function objectTypeSlugFromName(name: string): string {
  return normalizeObjectTypeName(name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
