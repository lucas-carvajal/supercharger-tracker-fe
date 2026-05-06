import "server-only";
import { ImportVersionResponseSchema } from "@/lib/contracts/admin-import";

export type CurrentImportVersionState =
  | {
      currentVersion: number;
      nextExpectedVersion: number;
      error: null;
    }
  | {
      currentVersion: null;
      nextExpectedVersion: null;
      error: string;
    };

function logAdminConfigError(message: string) {
  console.error(`[admin] ${message}`);
}

export async function getCurrentImportVersion(): Promise<CurrentImportVersionState> {
  const backendUrl = process.env.BACKEND_URL;
  if (!backendUrl) {
    logAdminConfigError(
      "BACKEND_URL is not configured for admin import version lookup.",
    );

    return {
      currentVersion: null,
      nextExpectedVersion: null,
      error: "Current import version is temporarily unavailable.",
    };
  }

  const internalSecret = process.env.RUST_INTERNAL_IMPORT_SECRET;
  if (!internalSecret) {
    logAdminConfigError(
      "RUST_INTERNAL_IMPORT_SECRET is not configured for admin import version lookup.",
    );

    return {
      currentVersion: null,
      nextExpectedVersion: null,
      error: "Current import version is temporarily unavailable.",
    };
  }

  const url = new URL("/admin/import/current-version", backendUrl);

  let upstreamResponse: Response;
  try {
    upstreamResponse = await fetch(url, {
      headers: {
        "X-Admin-Internal-Secret": internalSecret,
      },
      cache: "no-store",
    });
  } catch (error) {
    console.error(
      "[admin] Could not reach Rust backend import version endpoint.",
      error,
    );

    return {
      currentVersion: null,
      nextExpectedVersion: null,
      error: "Could not reach the backend import version endpoint.",
    };
  }

  let parsedJson: unknown = null;
  try {
    parsedJson = await upstreamResponse.json();
  } catch {
    parsedJson = null;
  }

  if (!upstreamResponse.ok) {
    console.error(
      `[admin] Import version lookup failed with HTTP ${upstreamResponse.status}.`,
    );

    return {
      currentVersion: null,
      nextExpectedVersion: null,
      error: "Current import version is temporarily unavailable.",
    };
  }

  const parsed = ImportVersionResponseSchema.safeParse(parsedJson);
  if (!parsed.success) {
    console.error(
      "[admin] Import version endpoint returned an invalid response.",
    );

    return {
      currentVersion: null,
      nextExpectedVersion: null,
      error: "Current import version is temporarily unavailable.",
    };
  }

  return {
    currentVersion: parsed.data.current_version,
    nextExpectedVersion: parsed.data.next_expected_version,
    error: null,
  };
}
