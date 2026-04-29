"use client";

import { useActionState } from "react";
import {
  runImport,
} from "@/app/(admin)/admin/actions";
import {
  initialImportFormState,
  type ImportFormState,
} from "@/app/(admin)/admin/form-state";
import { SubmitButton } from "@/components/admin/SubmitButton";

export function ImportForm() {
  const [state, action] = useActionState<ImportFormState, FormData>(
    runImport,
    initialImportFormState,
  );

  return (
    <form action={action} className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="payloadFile" className="text-sm font-medium text-white">
          JSON export file
        </label>
        <input
          id="payloadFile"
          name="payloadFile"
          type="file"
          accept="application/json,.json"
          className="block w-full rounded-2xl border border-white/12 bg-white/6 px-4 py-3 text-sm text-muted-foreground file:mr-4 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-primary-foreground hover:file:bg-primary/90"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="payloadJson" className="text-sm font-medium text-white">
          Or paste the export JSON
        </label>
        <textarea
          id="payloadJson"
          name="payloadJson"
          rows={12}
          placeholder='{"run_id": 42, "changed_chargers": []}'
          className="w-full rounded-3xl border border-white/12 bg-white/6 px-4 py-3 font-mono text-sm text-white outline-none transition focus:border-primary/60 focus:ring-3 focus:ring-primary/20"
        />
      </div>

      <label className="flex items-center gap-3 text-sm text-muted-foreground">
        <input
          type="checkbox"
          name="force"
          className="size-4 rounded border border-white/15 bg-white/6 accent-primary"
        />
        Force import ordering bypass for gap recovery
      </label>

      {state.error ? (
        <p className="rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-100">
          {state.error}
        </p>
      ) : null}

      {state.result ? (
        <p className="rounded-2xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
          {state.result}
        </p>
      ) : null}

      <SubmitButton idleLabel="Run import" pendingLabel="Running import..." />

      {state.response ? (
        <div className="space-y-2">
          <p className="text-sm font-medium text-white">Backend response</p>
          <pre className="overflow-x-auto rounded-3xl border border-white/10 bg-black/25 p-4 text-xs leading-6 text-slate-200">
            {state.response}
          </pre>
        </div>
      ) : null}
    </form>
  );
}
