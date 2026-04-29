"use server";

import { redirect } from "next/navigation";
import { clearAdminSession, createAdminSession, requireAdminSession } from "@/lib/admin-auth";
import type { ImportFormState, LoginFormState } from "@/app/(admin)/admin/form-state";

function logAdminConfigError(message: string) {
  console.error(`[admin] ${message}`);
}

export async function login(
  _previousState: LoginFormState,
  formData: FormData,
): Promise<LoginFormState> {
  const expectedPassword = process.env.ADMIN_PASSWORD;
  if (!expectedPassword) {
    logAdminConfigError("ADMIN_PASSWORD is not configured.");

    return {
      error: "Sign in is temporarily unavailable.",
    };
  }
  const expectedUsername = process.env.ADMIN_USERNAME ?? "admin52662";

  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (username !== expectedUsername || password !== expectedPassword) {
    return {
      error: "Invalid username or password.",
    };
  }

  try {
    await createAdminSession();
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "ADMIN_SESSION_SECRET is not set"
    ) {
      logAdminConfigError("ADMIN_SESSION_SECRET is not configured.");

      return {
        error: "Sign in is temporarily unavailable.",
      };
    }

    throw error;
  }

  redirect("/admin");
}

export async function logout() {
  await clearAdminSession();
  redirect("/admin/login");
}

export async function runImport(
  _previousState: ImportFormState,
  formData: FormData,
): Promise<ImportFormState> {
  await requireAdminSession();

  const backendUrl = process.env.BACKEND_URL;
  if (!backendUrl) {
    logAdminConfigError("BACKEND_URL is not configured for admin import.");

    return {
      error: "Import is temporarily unavailable.",
      result: null,
      response: null,
    };
  }

  const internalSecret = process.env.RUST_INTERNAL_IMPORT_SECRET;
  if (!internalSecret) {
    logAdminConfigError(
      "RUST_INTERNAL_IMPORT_SECRET is not configured for admin import.",
    );

    return {
      error: "Import is temporarily unavailable.",
      result: null,
      response: null,
    };
  }

  const uploadedFile = formData.get("payloadFile");
  const pastedJson = String(formData.get("payloadJson") ?? "").trim();
  const force = formData.get("force") === "on";

  let payloadText = pastedJson;
  if (uploadedFile instanceof File && uploadedFile.size > 0) {
    payloadText = await uploadedFile.text();
  }

  if (!payloadText) {
    return {
      error: "Upload a JSON export file or paste the export payload first.",
      result: null,
      response: null,
    };
  }

  let parsedPayload: unknown;
  try {
    parsedPayload = JSON.parse(payloadText);
  } catch {
    return {
      error: "The import payload is not valid JSON.",
      result: null,
      response: null,
    };
  }

  const url = new URL("/admin/import/scrapes", backendUrl);
  if (force) {
    url.searchParams.set("force", "true");
  }

  let upstreamResponse: Response;
  try {
    upstreamResponse = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Admin-Internal-Secret": internalSecret,
      },
      body: JSON.stringify(parsedPayload),
      cache: "no-store",
    });
  } catch (error) {
    console.error("[admin] Could not reach Rust backend import endpoint.", error);

    return {
      error: "Could not reach the Rust backend import endpoint.",
      result: null,
      response: null,
    };
  }

  let parsedResponse: unknown = null;
  try {
    parsedResponse = await upstreamResponse.json();
  } catch {
    parsedResponse = null;
  }

  const responseText = parsedResponse
    ? JSON.stringify(parsedResponse, null, 2)
    : `Import endpoint returned HTTP ${upstreamResponse.status}.`;

  if (!upstreamResponse.ok) {
    const errorMessage =
      parsedResponse &&
      typeof parsedResponse === "object" &&
      parsedResponse !== null &&
      "error" in parsedResponse &&
      typeof parsedResponse.error === "string"
        ? parsedResponse.error
        : `Import failed with HTTP ${upstreamResponse.status}.`;

    return {
      error: errorMessage,
      result: null,
      response: responseText,
    };
  }

  const status =
    parsedResponse &&
    typeof parsedResponse === "object" &&
    parsedResponse !== null &&
    "status" in parsedResponse &&
    typeof parsedResponse.status === "string"
      ? parsedResponse.status
      : "completed";

  return {
    error: null,
    result: `Import ${status.replaceAll("_", " ")} successfully.`,
    response: responseText,
  };
}
