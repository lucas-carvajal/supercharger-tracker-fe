import { cn } from "@/lib/utils";

interface OverlayNoticeProps {
  title: string;
  message: string;
  className?: string;
}

export function OverlayNotice({
  title,
  message,
  className,
}: OverlayNoticeProps) {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4">
      <div
        role="status"
        aria-live="polite"
        className={cn(
          "pointer-events-auto w-full max-w-xl rounded-2xl border border-amber-400/20 bg-background/90 px-4 py-3 shadow-2xl backdrop-blur-xl",
          className
        )}
      >
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}
