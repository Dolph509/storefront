"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";

export function BuyerChatProductContextCard({
  name,
  slug,
  thumbnailUrl,
  basePath,
}: {
  name: string;
  slug?: string;
  thumbnailUrl?: string | null;
  basePath: string;
}) {
  const t = useTranslations("messages");
  const href = slug ? `${basePath}/products/${slug}` : null;

  const body = (
    <div className="flex gap-3 rounded-xl border border-marketplace-border-subtle bg-marketplace-surface-warm/50 p-2.5 text-left">
      {thumbnailUrl ? (
        <Image
          src={thumbnailUrl}
          alt=""
          width={52}
          height={52}
          unoptimized
          className="size-[52px] shrink-0 rounded-lg border border-marketplace-border-subtle/80 object-cover"
        />
      ) : (
        <div
          className="size-[52px] shrink-0 rounded-lg bg-marketplace-surface-warm"
          aria-hidden
        />
      )}
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-marketplace-muted-foreground">
          {t("chatProductContextLabel")}
        </p>
        <p className="mt-0.5 line-clamp-2 text-sm font-medium text-marketplace-foreground">
          {name}
        </p>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block transition-opacity hover:opacity-90">
        {body}
      </Link>
    );
  }

  return body;
}
