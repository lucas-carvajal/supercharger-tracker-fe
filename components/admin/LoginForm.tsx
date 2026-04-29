"use client";

import { useActionState } from "react";
import {
  login,
} from "@/app/(admin)/admin/actions";
import {
  initialLoginFormState,
  type LoginFormState,
} from "@/app/(admin)/admin/form-state";
import { SubmitButton } from "@/components/admin/SubmitButton";

export function LoginForm() {
  const [state, action] = useActionState<LoginFormState, FormData>(
    login,
    initialLoginFormState,
  );

  return (
    <form action={action} className="space-y-5">
      <div className="space-y-2">
        <label htmlFor="username" className="text-sm font-medium text-white">
          Username
        </label>
        <input
          id="username"
          name="username"
          autoComplete="username"
          className="w-full rounded-2xl border border-white/12 bg-white/6 px-4 py-3 text-sm text-white outline-none transition focus:border-primary/60 focus:ring-3 focus:ring-primary/20"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium text-white">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="w-full rounded-2xl border border-white/12 bg-white/6 px-4 py-3 text-sm text-white outline-none transition focus:border-primary/60 focus:ring-3 focus:ring-primary/20"
        />
      </div>

      {state.error ? (
        <p className="rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-100">
          {state.error}
        </p>
      ) : null}

      <SubmitButton idleLabel="Sign in" pendingLabel="Signing in..." />
    </form>
  );
}
