export type CurrentImportVersionState =
  | {
      currentVersion: number;
      error: null;
    }
  | {
      currentVersion: null;
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
      error: "Could not reach the backend import version endpoint.",
    };
  }

  let parsedResponse: unknown = null;
  try {
    parsedResponse = await upstreamResponse.json();
  } catch {
    parsedResponse = null;
  }

  if (!upstreamResponse.ok) {
    console.error(
      `[admin] Import version lookup failed with HTTP ${upstreamResponse.status}.`,
    );

    return {
      currentVersion: null,
      error: "Current import version is temporarily unavailable.",
    };
  }

  if (
    !parsedResponse ||
    typeof parsedResponse !== "object" ||
    !("current_version" in parsedResponse) ||
    typeof parsedResponse.current_version !== "number"
  ) {
    console.error(
      "[admin] Import version endpoint returned an invalid response.",
    );

    return {
      currentVersion: null,
      error: "Current import version is temporarily unavailable.",
    };
  }

  return {
    currentVersion: parsedResponse.current_version,
    error: null,
  };
}
