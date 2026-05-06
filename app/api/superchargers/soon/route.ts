import { NextRequest } from "next/server";
import {
  SuperchargersSoonQuerySchema,
  SuperchargersSoonResponseSchema,
} from "@/lib/contracts/supercharger";

export async function GET(request: NextRequest) {
  const baseUrl = process.env.BACKEND_URL;
  if (!baseUrl) {
    return Response.json({ error: "API not configured" }, { status: 500 });
  }

  const { searchParams } = request.nextUrl;
  const query = SuperchargersSoonQuerySchema.parse({
    limit: searchParams.get("limit"),
    offset: searchParams.get("offset"),
    status: searchParams.get("status"),
    region: searchParams.get("region"),
  });

  const upstream = new URLSearchParams();
  upstream.set("limit", query.limit ?? "20");
  upstream.set("offset", query.offset ?? "0");
  if (query.status) upstream.set("status", query.status);
  if (query.region) upstream.set("region", query.region);

  const res = await fetch(
    `${baseUrl}/superchargers/soon?${upstream}`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    return Response.json(
      { error: `Upstream error: ${res.status}` },
      { status: res.status }
    );
  }

  const json: unknown = await res.json();
  const data = SuperchargersSoonResponseSchema.parse(json);
  return Response.json(data);
}
