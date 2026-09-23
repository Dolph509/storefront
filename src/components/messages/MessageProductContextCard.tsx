import type { Message } from "@spree/sdk";
import Link from "next/link";
import { useTranslations } from "next-intl";

interface MessageProductContextCardProps {
  message: Message;
  basePath: string;
}

export function MessageProductContextCard({
  message,
  basePath,
}: MessageProductContextCardProps) {
  const t = useTranslations("messages");
  if (!message.product_name) return null;

  const href = message.product_slug
    ? `${basePath}/products/${message.product_slug}`
    : null;

  const content = (
    <div className="mb-2 flex gap-3 rounded-lg border border-gray-200 bg-gray-50 p-2 text-sm">
      {message.product_thumbnail_url ? (
        // biome-ignore lint/performance/noImgElement: private blob path
        <img
          src={message.product_thumbnail_url}
          alt=""
          className="size-12 shrink-0 rounded object-cover"
        />
      ) : (
        <div className="size-12 shrink-0 rounded bg-gray-200" aria-hidden />
      )}
      <div className="min-w-0">
        <p className="font-medium text-gray-900 truncate">
          {message.product_name}
        </p>
        {!href ? (
          <p className="text-xs text-gray-500">
            {t("productContextUnavailable")}
          </p>
        ) : null}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block hover:opacity-90">
        {content}
      </Link>
    );
  }

  return content;
}
