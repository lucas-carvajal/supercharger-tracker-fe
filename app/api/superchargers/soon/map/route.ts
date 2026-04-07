import { NextRequest } from "next/server";

export async function GET() {
  const baseUrl = process.env.SUPERCHARGER_API_URL;
  if (!baseUrl) {
    return Response.json({ error: "API not configured" }, { status: 500 });
  }

  const res = await fetch(`${baseUrl}/superchargers/soon/map`, {
    cache: "no-store",
  });

  if (!res.ok) {
    return Response.json(
      { error: `Upstream error: ${res.status}` },
      { status: res.status }
    );
  }

  const data = await res.json();
  return Response.json(data);
}
