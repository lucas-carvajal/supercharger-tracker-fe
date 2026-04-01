import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const baseUrl = process.env.SUPERCHARGER_API_URL;
  if (!baseUrl) {
    return Response.json({ error: "API not configured" }, { status: 500 });
  }

  const { searchParams } = request.nextUrl;
  const upstream = new URLSearchParams();
  upstream.set("limit", searchParams.get("limit") ?? "20");
  upstream.set("offset", searchParams.get("offset") ?? "0");
  const status = searchParams.get("status");
  if (status) upstream.set("status", status);
  const region = searchParams.get("region");
  if (region) upstream.set("region", region);

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

  const data = await res.json();
  return Response.json(data);
}
