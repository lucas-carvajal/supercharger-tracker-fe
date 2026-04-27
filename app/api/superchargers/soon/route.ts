import { NextRequest } from "next/server";
import { ApiError, querySuperchargersSoon } from "@/lib/api";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const limit = Number.parseInt(searchParams.get("limit") ?? "20", 10);
  const offset = Number.parseInt(searchParams.get("offset") ?? "0", 10);
  const status = searchParams.get("status");
  const region = searchParams.get("region");

  try {
    const data = await querySuperchargersSoon({
      limit,
      offset,
      status,
      region,
    }, { noStore: true });
    return Response.json(data);
  } catch (error) {
    const statusCode = error instanceof ApiError ? error.status : 500;
    const message =
      error instanceof Error ? error.message : "Unknown upstream error";
    return Response.json({ error: message }, { status: statusCode });
  }
}
