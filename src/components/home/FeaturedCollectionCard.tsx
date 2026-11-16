import Image from "next/image";
import Link from "next/link";
import { SpreeIcon } from "@/components/icons";

interface FeaturedCollectionCardProps {
  href: string;
  title: string;
  description?: string | null;
  imageUrl: string;
  ctaLabel: string;
}

export function FeaturedCollectionCard({
  href,
  title,
  description,
  imageUrl,
  ctaLabel,
}: FeaturedCollectionCardProps) {
  return (
    <Link
      href={href}
      className="group flex h-full flex-col overflow-hidden rounded-md bg-white"
    >
      <div className="relative aspect-[1.8/1] overflow-hidden bg-marketplace-muted">
        <Image
          src={imageUrl}
          alt=""
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-200 ease-out group-hover:scale-[1.02]"
        />
      </div>
      <div className="flex flex-1 flex-col p-3">
        <h3 className="font-display text-lg font-semibold leading-none text-marketplace-foreground group-hover:text-marketplace-brand">
          {title}
        </h3>
        {description ? (
          <p className="mt-1 line-clamp-1 text-xs text-marketplace-muted-foreground">
            {description}
          </p>
        ) : null}
        <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-marketplace-brand">
          {ctaLabel}
          <SpreeIcon
            name="forward"
            className="size-3.5 transition-transform group-hover:translate-x-0.5"
            aria-hidden
          />
        </span>
      </div>
    </Link>
  );
}
