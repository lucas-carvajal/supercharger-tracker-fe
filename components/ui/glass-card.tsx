import { cn } from "@/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
}

export function GlassCard({ className, children, ...props }: GlassCardProps) {
  return (
    <div className={cn("glass-card rounded-xl p-5", className)} {...props}>
      {children}
    </div>
  );
}
