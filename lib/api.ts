export type SuperchargerStatus =
  | "IN_DEVELOPMENT"
  | "UNDER_CONSTRUCTION"
  | "UNKNOWN";

export interface Supercharger {
  id: string;
  title: string;
  latitude: number;
  longitude: number;
  status: SuperchargerStatus;
  raw_status_value: string;
  tesla_url: string;
  first_seen_at: string;
  last_scraped_at: string;
  details_fetch_failed: boolean;
}

export interface SuperchargerMapItem {
  id: string;
  title: string;
  latitude: number;
  longitude: number;
  status: SuperchargerStatus;
}

export interface SuperchargersSoonResponse {
  total: number;
  items: Supercharger[];
}

export interface StatsResponse {
  total_active: number;
  by_status: Partial<Record<SuperchargerStatus, number>>;
  as_of: string | null;
}

async function fetchJson(input: string): Promise<Response> {
  return fetch(input, {
    cache: "no-store",
  });
}

export async function getSuperchargersSoon(
  limit = 20
): Promise<SuperchargersSoonResponse> {
  const baseUrl = process.env.SUPERCHARGER_API_URL;
  if (!baseUrl) throw new Error("SUPERCHARGER_API_URL is not set");

  const res = await fetchJson(`${baseUrl}/superchargers/soon?limit=${limit}`);

  if (!res.ok)
    throw new Error(`Fetch failed: ${res.status} ${res.statusText}`);

  return res.json() as Promise<SuperchargersSoonResponse>;
}

export async function getStats(): Promise<StatsResponse> {
  const baseUrl = process.env.SUPERCHARGER_API_URL;
  if (!baseUrl) throw new Error("SUPERCHARGER_API_URL is not set");

  const res = await fetchJson(`${baseUrl}/superchargers/soon/stats`);

  if (!res.ok)
    throw new Error(`Fetch failed: ${res.status} ${res.statusText}`);

  return res.json() as Promise<StatsResponse>;
}

export async function getMapItems(): Promise<SuperchargerMapItem[]> {
  const baseUrl = process.env.SUPERCHARGER_API_URL;
  if (!baseUrl) throw new Error("SUPERCHARGER_API_URL is not set");

  const res = await fetchJson(`${baseUrl}/superchargers/soon/map`);

  if (!res.ok)
    throw new Error(`Fetch failed: ${res.status} ${res.statusText}`);

  return res.json() as Promise<SuperchargerMapItem[]>;
}
