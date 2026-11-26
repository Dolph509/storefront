import Link from "next/link";
import { connection } from "next/server";
import { getTranslations } from "next-intl/server";
import { MessageThreadDockRedirect } from "@/components/messages/MessageThreadDockRedirect";
import { getMessageThread, markMessageThreadRead } from "@/lib/data/messages";

interface MessageThreadPageProps {
  params: Promise<{
    country: string;
    locale: string;
    id: string;
  }>;
}

export default async function MessageThreadPage({
  params,
}: MessageThreadPageProps) {
  await connection();
  const { country, locale, id } = await params;
  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "messages",
  });
  const basePath = `/${country}/${locale}`;
  const thread = await getMessageThread(id);

  if (!thread) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-medium text-gray-900 mb-2">
          {t("threadNotFound")}
        </h2>
        <Link
          href={`${basePath}/account/messages`}
          className="text-primary hover:text-primary font-medium"
        >
          {t("backToInbox")}
        </Link>
      </div>
    );
  }

  if (thread.unread) {
    try {
      await markMessageThreadRead(id);
    } catch {
      // Non-blocking — the transcript still renders.
    }
  }

  return <MessageThreadDockRedirect thread={thread} basePath={basePath} />;
}
