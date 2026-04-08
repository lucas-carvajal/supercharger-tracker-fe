import { getMapItems } from "@/lib/api";

export async function GET() {
  try {
    const data = await getMapItems();
    return Response.json(data);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown upstream error";
    const status = message.includes("404") ? 404 : 500;
    return Response.json({ error: message }, { status });
  }
}
