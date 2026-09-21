import { connection } from "next/server";
import { getTranslations } from "next-intl/server";
import { MessageThreadList } from "@/components/account/MessageThreadList";
import { getMessageThreads } from "@/lib/data/messages";

interface MessagesPageProps {
  params: Promise<{ country: string; locale: string }>;
}

export default async function MessagesPage({ params }: MessagesPageProps) {
  await connection();
  const { country, locale } = await params;
  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "messages",
  });
  const basePath = `/${country}/${locale}`;
  const response = await getMessageThreads({ limit: 50 });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {t("inboxTitle")}
      </h1>
      <MessageThreadList
        threads={response.data}
        basePath={basePath}
        locale={locale}
      />
    </div>
  );
}
