import type { z } from "zod";
import {
  SuperchargerDetailSchema,
  SuperchargerMapItemsSchema,
  SuperchargersSoonResponseSchema,
} from "@/lib/contracts/supercharger";
import { StatsResponseSchema } from "@/lib/contracts/stats";
import { RecentStatusChangesResponseSchema } from "@/lib/contracts/recent-changes";

export type {
  Supercharger,
  SuperchargerDetail,
  SuperchargerMapItem,
  SuperchargerStatus,
  SuperchargerStatusHistoryEntry,
  SuperchargersSoonResponse,
} from "@/lib/contracts/supercharger";
export type { StatsResponse } from "@/lib/contracts/stats";
export type {
  RecentStatusChange,
  RecentStatusChangesResponse,
} from "@/lib/contracts/recent-changes";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function fetchAndParse<TSchema extends z.ZodType>(
  input: string,
  schema: TSchema,
): Promise<z.infer<TSchema>> {
  const res = await fetch(input, { next: { revalidate: 60 } });

  if (!res.ok) {
    throw new ApiError(
      `Fetch failed: ${res.status} ${res.statusText}`,
      res.status,
    );
  }

  const json: unknown = await res.json();
  return schema.parse(json);
}

function requireBackendUrl(): string {
  const baseUrl = process.env.BACKEND_URL;
  if (!baseUrl) throw new Error("BACKEND_URL is not set");
  return baseUrl;
}

export async function getSuperchargersSoon(limit = 20) {
  const baseUrl = requireBackendUrl();
  return fetchAndParse(
    `${baseUrl}/superchargers/soon?limit=${limit}`,
    SuperchargersSoonResponseSchema,
  );
}

export async function getStats() {
  const baseUrl = requireBackendUrl();
  return fetchAndParse(
    `${baseUrl}/superchargers/soon/stats`,
    StatsResponseSchema,
  );
}

export async function getMapItems() {
  const baseUrl = requireBackendUrl();
  return fetchAndParse(
    `${baseUrl}/superchargers/soon/map`,
    SuperchargerMapItemsSchema,
  );
}

export async function getSupercharger(id: string) {
  const baseUrl = requireBackendUrl();
  return fetchAndParse(
    `${baseUrl}/superchargers/soon/${id}`,
    SuperchargerDetailSchema,
  );
}

export async function getRecentStatusChanges(limit = 20, offset = 0) {
  const baseUrl = requireBackendUrl();
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  });
  return fetchAndParse(
    `${baseUrl}/superchargers/soon/recent-changes?${params}`,
    RecentStatusChangesResponseSchema,
  );
}
