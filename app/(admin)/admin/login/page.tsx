import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/LoginForm";
import { GlassCard } from "@/components/ui/glass-card";
import { getAdminSession } from "@/lib/admin-auth";

export default async function AdminLoginPage() {
  const session = await getAdminSession();
  if (session) {
    redirect("/admin");
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 items-center">
      <GlassCard className="w-full rounded-[2rem] border border-white/10 bg-white/7 p-8 shadow-2xl shadow-black/35">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/80">
          Restricted access
        </p>
        <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight text-white">
          Sign in to admin
        </h2>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          This area is intentionally unlinked from the public site. Use the admin
          password to access imports and protected actions.
        </p>

        <div className="mt-8">
          <LoginForm />
        </div>
      </GlassCard>
    </div>
  );
}
