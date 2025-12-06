// lib/api/normalize.ts
// helper to normalize list responses from various backend shapes
export function normalizeListResponse<T>(data: any): { items: T[]; total: number } {
  if (!data) return { items: [], total: 0 };
  if (Array.isArray(data)) return { items: data as T[], total: data.length };
  if (Array.isArray(data.projects)) return { items: data.projects as T[], total: typeof data.total === 'number' ? data.total : data.projects.length };
  if (Array.isArray(data.data)) return { items: data.data as T[], total: typeof data.total === 'number' ? data.total : data.data.length };
  if (Array.isArray(data.items)) return { items: data.items as T[], total: typeof data.total === 'number' ? data.total : data.items.length };
  if (Array.isArray(data.records)) return { items: data.records as T[], total: typeof data.total === 'number' ? data.total : data.records.length };
  // find any array value
  const arr = Object.values(data).find((v) => Array.isArray(v)) as T[] | undefined;
  if (arr) return { items: arr, total: typeof (data as any).total === 'number' ? (data as any).total : arr.length };
  // single object fallback
  if ((data as any).id) return { items: [data as T], total: 1 };
  return { items: [], total: 0 };
}

