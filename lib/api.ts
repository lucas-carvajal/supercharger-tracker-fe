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

export interface SuperchargersSoonQuery {
  limit?: number;
  offset?: number;
  status?: string | null;
  region?: string | null;
}

export interface SuperchargersSoonQueryOptions {
  noStore?: boolean;
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

async function fetchDataNoStore<T>(input: string): Promise<T> {
  const res = await fetch(input, { cache: "no-store" });

  if (!res.ok) {
    throw new ApiError(`Fetch failed: ${res.status} ${res.statusText}`, res.status);
  }

  return res.json() as Promise<T>;
}

function isMockDataEnabled() {
  return process.env.ENABLE_MOCK_DATA?.trim().toLowerCase() === "true";
}

function clampToNonNegativeInteger(value: number | undefined, fallback: number) {
  if (typeof value !== "number" || Number.isNaN(value) || value < 0) {
    return fallback;
  }
  return Math.floor(value);
}

const MOCK_SUPERCHARGER_DETAILS: SuperchargerDetail[] = [
  {
    id: "mock-miami-gardens-fl",
    title: "Miami Gardens, FL",
    city: "Miami Gardens",
    region: "US",
    latitude: 25.942,
    longitude: -80.2456,
    status: "UNDER_CONSTRUCTION",
    raw_status_value: "UNDER_CONSTRUCTION",
    tesla_url: "https://www.tesla.com/findus/location/supercharger/mock-miami-gardens-fl",
    first_seen_at: "2026-01-12T10:15:00.000Z",
    last_scraped_at: "2026-04-26T08:00:00.000Z",
    details_fetch_failed: false,
    status_history: [
      {
        old_status: null,
        new_status: "IN_DEVELOPMENT",
        changed_at: "2026-01-12T10:15:00.000Z",
      },
      {
        old_status: "IN_DEVELOPMENT",
        new_status: "UNDER_CONSTRUCTION",
        changed_at: "2026-03-03T13:05:00.000Z",
      },
    ],
  },
  {
    id: "mock-boise-id",
    title: "Boise, ID",
    city: "Boise",
    region: "US",
    latitude: 43.615,
    longitude: -116.2023,
    status: "IN_DEVELOPMENT",
    raw_status_value: "IN_DEVELOPMENT",
    tesla_url: "https://www.tesla.com/findus/location/supercharger/mock-boise-id",
    first_seen_at: "2026-02-20T09:00:00.000Z",
    last_scraped_at: "2026-04-25T15:30:00.000Z",
    details_fetch_failed: false,
    status_history: [
      {
        old_status: null,
        new_status: "IN_DEVELOPMENT",
        changed_at: "2026-02-20T09:00:00.000Z",
      },
    ],
  },
  {
    id: "mock-calgary-ab",
    title: "Calgary, AB",
    city: "Calgary",
    region: "Canada",
    latitude: 51.0447,
    longitude: -114.0719,
    status: "UNDER_CONSTRUCTION",
    raw_status_value: "UNDER_CONSTRUCTION",
    tesla_url: "https://www.tesla.com/findus/location/supercharger/mock-calgary-ab",
    first_seen_at: "2025-12-02T11:45:00.000Z",
    last_scraped_at: "2026-04-24T11:20:00.000Z",
    details_fetch_failed: false,
    status_history: [
      {
        old_status: null,
        new_status: "IN_DEVELOPMENT",
        changed_at: "2025-12-02T11:45:00.000Z",
      },
      {
        old_status: "IN_DEVELOPMENT",
        new_status: "UNDER_CONSTRUCTION",
        changed_at: "2026-02-14T16:10:00.000Z",
      },
    ],
  },
  {
    id: "mock-leeds-uk",
    title: "Leeds, UK",
    city: "Leeds",
    region: "United Kingdom",
    latitude: 53.7996,
    longitude: -1.5491,
    status: "IN_DEVELOPMENT",
    raw_status_value: "IN_DEVELOPMENT",
    tesla_url: "https://www.tesla.com/findus/location/supercharger/mock-leeds-uk",
    first_seen_at: "2026-03-09T17:20:00.000Z",
    last_scraped_at: "2026-04-23T07:45:00.000Z",
    details_fetch_failed: false,
    status_history: [
      {
        old_status: null,
        new_status: "IN_DEVELOPMENT",
        changed_at: "2026-03-09T17:20:00.000Z",
      },
    ],
  },
  {
    id: "mock-cologne-de",
    title: "Cologne, Germany",
    city: "Cologne",
    region: "Germany",
    latitude: 50.9375,
    longitude: 6.9603,
    status: "UNDER_CONSTRUCTION",
    raw_status_value: "UNDER_CONSTRUCTION",
    tesla_url: "https://www.tesla.com/findus/location/supercharger/mock-cologne-de",
    first_seen_at: "2025-11-17T06:50:00.000Z",
    last_scraped_at: "2026-04-21T10:35:00.000Z",
    details_fetch_failed: false,
    status_history: [
      {
        old_status: null,
        new_status: "IN_DEVELOPMENT",
        changed_at: "2025-11-17T06:50:00.000Z",
      },
      {
        old_status: "IN_DEVELOPMENT",
        new_status: "UNDER_CONSTRUCTION",
        changed_at: "2026-01-28T12:10:00.000Z",
      },
    ],
  },
  {
    id: "mock-kawasaki-jp",
    title: "Kawasaki, Japan",
    city: "Kawasaki",
    region: "Japan",
    latitude: 35.5308,
    longitude: 139.7036,
    status: "IN_DEVELOPMENT",
    raw_status_value: "IN_DEVELOPMENT",
    tesla_url: "https://www.tesla.com/findus/location/supercharger/mock-kawasaki-jp",
    first_seen_at: "2026-02-01T20:05:00.000Z",
    last_scraped_at: "2026-04-20T09:10:00.000Z",
    details_fetch_failed: false,
    status_history: [
      {
        old_status: null,
        new_status: "IN_DEVELOPMENT",
        changed_at: "2026-02-01T20:05:00.000Z",
      },
    ],
  },
];

function stripDetail(detail: SuperchargerDetail): Supercharger {
  return {
    id: detail.id,
    title: detail.title,
    city: detail.city,
    region: detail.region,
    latitude: detail.latitude,
    longitude: detail.longitude,
    status: detail.status,
    raw_status_value: detail.raw_status_value,
    tesla_url: detail.tesla_url,
    first_seen_at: detail.first_seen_at,
    last_scraped_at: detail.last_scraped_at,
    details_fetch_failed: detail.details_fetch_failed,
  };
}

function getOrderedMockDetails() {
  return [...MOCK_SUPERCHARGER_DETAILS].sort(
    (a, b) =>
      new Date(b.last_scraped_at).getTime() - new Date(a.last_scraped_at).getTime(),
  );
}

function getMockSuperchargersSoon(
  query: SuperchargersSoonQuery = {},
): SuperchargersSoonResponse {
  const limit = clampToNonNegativeInteger(query.limit, 20);
  const offset = clampToNonNegativeInteger(query.offset, 0);
  const statusFilter = query.status?.trim() || null;
  const regionFilter = query.region?.trim() || null;

  const filtered = getOrderedMockDetails().filter((item) => {
    const statusMatches = statusFilter ? item.status === statusFilter : true;
    const regionMatches = regionFilter ? item.region === regionFilter : true;
    return statusMatches && regionMatches;
  });

  return {
    total: filtered.length,
    items: filtered.slice(offset, offset + limit).map(stripDetail),
  };
}

function getMockStats(): StatsResponse {
  const ordered = getOrderedMockDetails();
  const byStatus: Partial<Record<SuperchargerStatus, number>> = {};

  for (const site of ordered) {
    byStatus[site.status] = (byStatus[site.status] ?? 0) + 1;
  }

  return {
    total_active: ordered.length,
    by_status: byStatus,
    as_of: ordered[0]?.last_scraped_at ?? null,
  };
}

function getMockMapItems(): SuperchargerMapItem[] {
  return getOrderedMockDetails().map((site) => ({
    id: site.id,
    title: site.title,
    latitude: site.latitude,
    longitude: site.longitude,
    status: site.status,
  }));
}

export async function getSuperchargersSoon(
  limit = 20,
): Promise<SuperchargersSoonResponse> {
  return querySuperchargersSoon({ limit, offset: 0 });
}

export async function querySuperchargersSoon(
  query: SuperchargersSoonQuery = {},
  options: SuperchargersSoonQueryOptions = {},
): Promise<SuperchargersSoonResponse> {
  if (isMockDataEnabled()) {
    return getMockSuperchargersSoon(query);
  }

  const baseUrl = process.env.BACKEND_URL;
  if (!baseUrl) throw new Error("BACKEND_URL is not set");

  const limit = clampToNonNegativeInteger(query.limit, 20);
  const offset = clampToNonNegativeInteger(query.offset, 0);
  const upstream = new URLSearchParams();
  upstream.set("limit", String(limit));
  upstream.set("offset", String(offset));
  if (query.status?.trim()) upstream.set("status", query.status.trim());
  if (query.region?.trim()) upstream.set("region", query.region.trim());

  const url = `${baseUrl}/superchargers/soon?${upstream}`;
  if (options.noStore) {
    return fetchDataNoStore<SuperchargersSoonResponse>(url);
  }
  return fetchData<SuperchargersSoonResponse>(url);
}

export async function getStats(): Promise<StatsResponse> {
  if (isMockDataEnabled()) {
    return getMockStats();
  }

  const baseUrl = process.env.BACKEND_URL;
  if (!baseUrl) throw new Error("BACKEND_URL is not set");

  return fetchData<StatsResponse>(`${baseUrl}/superchargers/soon/stats`);
}

export async function getMapItems(): Promise<SuperchargerMapItem[]> {
  if (isMockDataEnabled()) {
    return getMockMapItems();
  }

  const baseUrl = process.env.BACKEND_URL;
  if (!baseUrl) throw new Error("BACKEND_URL is not set");

  return fetchData<SuperchargerMapItem[]>(`${baseUrl}/superchargers/soon/map`);
}

export async function getSupercharger(id: string): Promise<SuperchargerDetail> {
  if (isMockDataEnabled()) {
    const detail = MOCK_SUPERCHARGER_DETAILS.find((site) => site.id === id);
    if (!detail) {
      throw new ApiError("Fetch failed: 404 Not Found", 404);
    }
    return detail;
  }

  const baseUrl = process.env.BACKEND_URL;
  if (!baseUrl) throw new Error("BACKEND_URL is not set");

  return fetchData<SuperchargerDetail>(`${baseUrl}/superchargers/soon/${id}`);
}
