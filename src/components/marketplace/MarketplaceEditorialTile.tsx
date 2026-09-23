import Link from "next/link";
import { cn } from "@/lib/utils";

type EditorialTileAspect = "landscape" | "square";

interface MarketplaceEditorialTileProps {
  href: string;
  title: string;
  eyebrow?: string;
  imageUrl?: string | null;
  aspect?: EditorialTileAspect;
  className?: string;
}

const aspectClass: Record<EditorialTileAspect, string> = {
  landscape: "aspect-[4/3]",
  square: "aspect-square",
};

export function MarketplaceEditorialTile({
  href,
  title,
  eyebrow,
  imageUrl,
  aspect = "landscape",
  className,
}: MarketplaceEditorialTileProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex flex-col overflow-hidden rounded-[var(--marketplace-radius-md)] border border-marketplace-border-subtle bg-marketplace-surface-elevated shadow-[var(--marketplace-shadow-card)] transition-shadow hover:shadow-[var(--marketplace-shadow-card-hover)]",
        className,
      )}
    >
      <div
        className={cn(
          "relative w-full overflow-hidden bg-marketplace-muted",
          aspectClass[aspect],
        )}
      >
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        ) : null}
      </div>
      <div className="p-4">
        {eyebrow ? (
          <p className="text-xs font-medium uppercase tracking-wide text-marketplace-muted-foreground">
            {eyebrow}
          </p>
        ) : null}
        <h3 className="mt-1 font-semibold text-marketplace-foreground group-hover:text-marketplace-brand">
          {title}
        </h3>
      </div>
    </Link>
  );
}
