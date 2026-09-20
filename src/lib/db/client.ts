const INSFORGE_BASE_URL =
  process.env.INSFORGE_BASE_URL ||
  process.env.NEXT_PUBLIC_INSFORGE_BASE_URL ||
  "http://43.157.228.75:7130";
const INSFORGE_API_KEY =
  process.env.INSFORGE_API_KEY ||
  process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY ||
  "ik_199085965775f19a019dd1465fe7cf114c3aa112";

export interface DbQueryOptions {
  limit?: number;
  offset?: number;
  order?: string;
  select?: string;
  filters?: Record<string, string>;
}

export async function dbSelect<T = any>(
  table: string,
  options: DbQueryOptions = {}
): Promise<T[]> {
  const url = new URL(`/api/database/records/${table}`, INSFORGE_BASE_URL);

  if (options.limit !== undefined) url.searchParams.set("limit", String(options.limit));
  if (options.offset !== undefined) url.searchParams.set("offset", String(options.offset));
  if (options.order) url.searchParams.set("order", options.order);
  if (options.select) url.searchParams.set("select", options.select);

  if (options.filters) {
    for (const [key, value] of Object.entries(options.filters)) {
      url.searchParams.set(key, value);
    }
  }

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${INSFORGE_API_KEY}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to query table ${table} (${res.status}): ${errorText}`);
  }

  return res.json();
}

export async function dbInsert<T = any>(
  table: string,
  records: any | any[]
): Promise<T[]> {
  const url = new URL(`/api/database/records/${table}`, INSFORGE_BASE_URL);
  const payload = Array.isArray(records) ? records : [records];

  const res = await fetch(url.toString(), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${INSFORGE_API_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to insert into ${table} (${res.status}): ${errorText}`);
  }

  return res.json();
}

export async function dbUpdate<T = any>(
  table: string,
  filterKey: string,
  filterValue: string,
  patch: any
): Promise<T[]> {
  const url = new URL(`/api/database/records/${table}`, INSFORGE_BASE_URL);
  url.searchParams.set(filterKey, `eq.${filterValue}`);

  const res = await fetch(url.toString(), {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${INSFORGE_API_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify(patch),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to update ${table} (${res.status}): ${errorText}`);
  }

  return res.json();
}

export async function dbDelete(
  table: string,
  filterKey: string,
  filterValue: string
): Promise<void> {
  const url = new URL(`/api/database/records/${table}`, INSFORGE_BASE_URL);
  url.searchParams.set(filterKey, `eq.${filterValue}`);

  const res = await fetch(url.toString(), {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${INSFORGE_API_KEY}`,
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to delete from ${table} (${res.status}): ${errorText}`);
  }
}
