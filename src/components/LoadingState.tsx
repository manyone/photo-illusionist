import { cn } from "@/lib/utils";

export const LoadingState = ({ className }: { className?: string }) => {
  return (
    <div className={cn("relative overflow-hidden rounded-lg bg-muted", className)}>
      <div className="h-full w-full">
        <div className="relative h-full w-full">
          <div
            className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent"
            style={{
              backgroundImage: "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.08), transparent)",
            }}
          />
        </div>
      </div>
    </div>
  );
};