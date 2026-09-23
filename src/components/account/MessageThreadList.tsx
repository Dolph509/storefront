import type { MessageThread } from "@spree/sdk";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { EmptyStateIllustration } from "@/components/empty-states/EmptyStateIllustration";
import { formatDateTime } from "@/lib/utils/format";

interface MessageThreadListProps {
  threads: MessageThread[];
  basePath: string;
  locale: string;
}

export async function MessageThreadList({
  threads,
  basePath,
  locale,
}: MessageThreadListProps) {
  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "messages",
  });

  if (threads.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <EmptyStateIllustration
          name="no-messages-yet"
          className="mx-auto mb-4 text-gray-600"
        />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {t("emptyTitle")}
        </h3>
        <p className="text-gray-500">{t("emptyDescription")}</p>
      </div>
    );
  }

  return (
    <ul className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-200 overflow-hidden">
      {threads.map((thread) => (
        <li key={thread.id}>
          <Link
            href={`${basePath}/account/messages/${thread.id}`}
            className="flex flex-col gap-1 px-6 py-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="font-medium text-gray-900 truncate">
                {thread.seller_name || t("sellerFallback")}
              </p>
              <span className="text-xs text-gray-500 whitespace-nowrap">
                {formatDateTime(thread.updated_at, locale)}
              </span>
            </div>
            {thread.last_message_product_name ? (
              <p className="text-xs text-gray-500 truncate">
                {thread.last_message_product_name}
              </p>
            ) : null}
            <p className="text-sm text-gray-600 truncate">
              {thread.last_message_preview || t("noPreview")}
            </p>
            {thread.unread ? (
              <span className="text-xs font-medium text-primary">
                {t("unread")}
              </span>
            ) : null}
          </Link>
        </li>
      ))}
    </ul>
  );
}
