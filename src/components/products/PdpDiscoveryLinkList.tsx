import { PdpDiscoveryLinkCard } from "@/components/products/PdpDiscoveryLinkCard";
import type { PdpDiscoveryItem } from "@/lib/pdp/discovery-items";
import { cn } from "@/lib/utils";

type PdpDiscoveryLinkListProps = {
  items: PdpDiscoveryItem[];
  coverByItemKey: Map<string, string | null>;
  variant: "circle" | "tile";
  className?: string;
};

export function PdpDiscoveryLinkList({
  items,
  coverByItemKey,
  variant,
  className,
}: PdpDiscoveryLinkListProps) {
  if (!items.length) return null;

  return (
    <ul className={className}>
      {items.map((item) => (
        <li
          key={item.key}
          className={cn(variant === "circle" ? "shrink-0" : "min-h-0")}
        >
          <PdpDiscoveryLinkCard
            href={item.href}
            label={item.label}
            imageUrl={coverByItemKey.get(item.key) ?? null}
            variant={variant}
          />
        </li>
      ))}
    </ul>
  );
}
