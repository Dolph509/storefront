import { Search } from "lucide-react";
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
            <Search
              className="size-5 text-marketplace-muted-foreground"
              aria-hidden
            />
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
        "group flex h-full min-h-[60px] items-center gap-2.5 overflow-hidden rounded-[10px]",
        "border border-[#e7e4de] bg-white p-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.025)]",
        "transition-all hover:border-[#d4d0c8] hover:shadow-sm sm:min-h-[72px] sm:gap-3 sm:p-2",
        className,
      )}
    >
      <span className="relative flex size-[46px] shrink-0 items-center justify-center overflow-hidden rounded-[7px] bg-[#f3f0ea] sm:size-[56px]">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt=""
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-[1.04]"
            sizes="56px"
          />
        ) : (
          <Search className="size-4 text-[#8c8780]" aria-hidden />
        )}
      </span>
      <span className="line-clamp-3 min-w-0 flex-1 pr-1 text-left text-[12px] font-medium leading-[1.3] text-[#1a1a1a] group-hover:underline sm:pr-1.5 sm:text-[13px] sm:leading-[1.35]">
        {label}
      </span>
    </Link>
  );
}
