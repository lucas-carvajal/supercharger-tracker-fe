"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";

interface SubmitButtonProps {
  idleLabel: string;
  pendingLabel: string;
  variant?: React.ComponentProps<typeof Button>["variant"];
}

export function SubmitButton({
  idleLabel,
  pendingLabel,
  variant,
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" variant={variant} disabled={pending}>
      {pending ? pendingLabel : idleLabel}
    </Button>
  );
}
