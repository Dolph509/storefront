import { cn } from "@/lib/utils";

export function ShopCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex animate-pulse flex-col gap-4 rounded-[var(--marketplace-radius-md)] border border-marketplace-border-subtle bg-marketplace-surface-elevated p-4",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <div className="size-12 rounded-full bg-marketplace-muted" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-2/3 rounded bg-marketplace-muted" />
          <div className="h-3 w-1/2 rounded bg-marketplace-muted" />
        </div>
      </div>
      <div className="mt-auto h-9 rounded-[var(--marketplace-radius-sm)] bg-marketplace-muted" />
    </div>
  );
}
