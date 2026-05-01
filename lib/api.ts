export type SuperchargerStatus =
  | "IN_DEVELOPMENT"
  | "UNDER_CONSTRUCTION"
  | "UNKNOWN";

export type SuperchargerHistoryStatus =
  | SuperchargerStatus
  | "OPENED"
  | "REMOVED";

export interface Supercharger {
  id: string;
  title: string;
  city: string | null;
  region: string | null;
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

export interface SuperchargerStatusHistoryEntry {
  old_status: SuperchargerHistoryStatus | null;
  new_status: SuperchargerHistoryStatus;
  changed_at: string;
}

export interface SuperchargerDetail extends Supercharger {
  status_history: SuperchargerStatusHistoryEntry[];
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

export interface RecentStatusChange {
  id: string;
  title: string;
  city: string | null;
  region: string | null;
  old_status: SuperchargerHistoryStatus;
  new_status: SuperchargerHistoryStatus;
  changed_at: string;
}

export interface RecentStatusChangesResponse {
  total: number;
  items: RecentStatusChange[];
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function fetchJson(input: string): Promise<Response> {
  return fetch(input, {
    next: { revalidate: 60 },
  });
}

async function fetchData<T>(input: string): Promise<T> {
  const res = await fetchJson(input);

  if (!res.ok) {
    throw new ApiError(`Fetch failed: ${res.status} ${res.statusText}`, res.status);
  }

  return res.json() as Promise<T>;
}

export async function getSuperchargersSoon(
  limit = 20
): Promise<SuperchargersSoonResponse> {
  const baseUrl = process.env.BACKEND_URL;
  if (!baseUrl) throw new Error("BACKEND_URL is not set");

  return fetchData<SuperchargersSoonResponse>(
    `${baseUrl}/superchargers/soon?limit=${limit}`,
  );
}

export async function getStats(): Promise<StatsResponse> {
  const baseUrl = process.env.BACKEND_URL;
  if (!baseUrl) throw new Error("BACKEND_URL is not set");

  return fetchData<StatsResponse>(`${baseUrl}/superchargers/soon/stats`);
}

export async function getMapItems(): Promise<SuperchargerMapItem[]> {
  const baseUrl = process.env.BACKEND_URL;
  if (!baseUrl) throw new Error("BACKEND_URL is not set");

  return fetchData<SuperchargerMapItem[]>(`${baseUrl}/superchargers/soon/map`);
}

export async function getSupercharger(id: string): Promise<SuperchargerDetail> {
  const baseUrl = process.env.BACKEND_URL;
  if (!baseUrl) throw new Error("BACKEND_URL is not set");

  return fetchData<SuperchargerDetail>(`${baseUrl}/superchargers/soon/${id}`);
}

export async function getRecentStatusChanges(
  limit = 20,
  offset = 0,
): Promise<RecentStatusChangesResponse> {
  const baseUrl = process.env.BACKEND_URL;
  if (!baseUrl) throw new Error("BACKEND_URL is not set");

  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  });
  return fetchData<RecentStatusChangesResponse>(
    `${baseUrl}/superchargers/soon/recent-changes?${params}`,
  );
}
