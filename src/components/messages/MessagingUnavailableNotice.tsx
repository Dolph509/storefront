"use client";

import { useTranslations } from "next-intl";

export function MessagingUnavailableNotice({
  className,
}: {
  className?: string;
}) {
  const t = useTranslations("messages");
  return (
    <p className={className ?? "text-sm text-gray-500"}>
      {t("messagingUnavailable")}
    </p>
  );
}
