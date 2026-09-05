"use client";

import { useActionState } from "react";
import { runCountryBackfill } from "@/app/(admin)/admin/actions";
import {
  initialBackfillFormState,
  type BackfillFormState,
} from "@/app/(admin)/admin/form-state";
import { SubmitButton } from "@/components/admin/SubmitButton";

export function CountryBackfillForm() {
  const [state, action] = useActionState<BackfillFormState, FormData>(
    runCountryBackfill,
    initialBackfillFormState,
  );

  return (
    <form action={action} className="space-y-6">
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

      <SubmitButton
        idleLabel="Run country backfill"
        pendingLabel="Running country backfill..."
      />

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
