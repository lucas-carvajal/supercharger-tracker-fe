import { NextRequest } from "next/server";
import {
  RecentUpdatesQuerySchema,
  RecentUpdatesResponseSchema,
} from "@/lib/contracts/recent-updates";

export async function GET(request: NextRequest) {
  const baseUrl = process.env.BACKEND_URL;
  if (!baseUrl) {
    return Response.json({ error: "API not configured" }, { status: 500 });
  }

  const { searchParams } = request.nextUrl;
  const query = RecentUpdatesQuerySchema.parse({
    limit: searchParams.get("limit"),
    offset: searchParams.get("offset"),
  });

  const upstream = new URLSearchParams();
  upstream.set("limit", query.limit ?? "20");
  upstream.set("offset", query.offset ?? "0");

  const res = await fetch(
    `${baseUrl}/superchargers/soon/recent-updates?${upstream}`,
    { cache: "no-store" },
  );

  if (!res.ok) {
    return Response.json(
      { error: `Upstream error: ${res.status}` },
      { status: res.status },
    );
  }

  const json: unknown = await res.json();
  const data = RecentUpdatesResponseSchema.parse(json);
  return Response.json(data);
}
