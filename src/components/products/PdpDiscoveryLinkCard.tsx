import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

type PdpDiscoveryLinkCardProps = {
  href: string;
  label: string;
  imageUrl?: string | null;
  variant: "circle" | "tile";
  className?: string;
};

export function PdpDiscoveryLinkCard({
  href,
  label,
  imageUrl,
  variant,
  className,
}: PdpDiscoveryLinkCardProps) {
  if (variant === "circle") {
    return (
      <Link
        href={href}
        className={cn("group flex flex-col items-center gap-2", className)}
      >
        <span
          className={cn(
            "relative flex size-[72px] items-center justify-center overflow-hidden rounded-full sm:size-20",
            "bg-marketplace-surface shadow-[var(--marketplace-shadow-card)] ring-1 ring-marketplace-border-subtle",
            "transition-shadow group-hover:shadow-[var(--marketplace-shadow-card-hover)]",
          )}
        >
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt=""
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-[1.04]"
              sizes="80px"
            />
          ) : (
            <span className="px-2 text-center text-[10px] font-semibold leading-tight text-marketplace-muted-foreground">
              {label.slice(0, 14)}
            </span>
          )}
        </span>
        <span className="line-clamp-2 max-w-[96px] text-center text-xs font-medium text-marketplace-foreground group-hover:underline">
          {label}
        </span>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={cn(
        "group flex h-full min-h-[3.25rem] items-center gap-2.5 overflow-hidden rounded-lg",
        "border border-marketplace-border-subtle bg-marketplace-surface p-2 sm:min-h-14 sm:gap-3 sm:p-2.5",
        "transition-colors hover:border-marketplace-border hover:bg-marketplace-surface-warm/60",
        className,
      )}
    >
      <span
        className={cn(
          "relative size-11 shrink-0 overflow-hidden rounded-md bg-marketplace-muted",
          "sm:size-12",
        )}
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 640px) 44px, 48px"
          />
        ) : (
          <span className="flex h-full items-center justify-center px-1 text-center text-[10px] font-semibold leading-tight text-marketplace-muted-foreground">
            {label.slice(0, 12)}
          </span>
        )}
      </span>
      <span
        className={cn(
          "line-clamp-2 min-w-0 flex-1 text-left text-sm font-semibold leading-snug",
          "text-marketplace-foreground group-hover:underline",
        )}
      >
        {label}
      </span>
    </Link>
  );
}
