"use client";

import { Sparkles } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

interface AskTheCuratorButtonProps {
  href: string;
}

export function AskTheCuratorButton({ href }: AskTheCuratorButtonProps) {
  const t = useTranslations("header");

  return (
    <div className="relative hidden shrink-0 lg:block">
      <span className="absolute -right-1 -top-2 z-10 rounded-sm bg-[#e8f5a8] px-1 py-0.5 text-[9px] font-semibold uppercase leading-none tracking-wide text-marketplace-brand">
        {t("curatorBeta")}
      </span>
      <Link
        href={href}
        className="inline-flex h-12 items-center gap-2 rounded-full border-2 border-marketplace-brand/30 bg-marketplace-curator px-4 text-sm font-medium text-marketplace-brand transition-colors hover:border-marketplace-brand/50"
      >
        <Sparkles className="size-4 shrink-0" aria-hidden />
        {t("askTheCurator")}
      </Link>
    </div>
  );
}
