/** Complete legacy catalogs have no creation timestamp in their API contract. */
export function newestFirst<T extends { id: number }>(items: readonly T[]): T[] {
  return [...items].sort((a, b) => b.id - a.id);
}
