"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState, useTransition } from "react";
import { AccountPageHeader } from "@/components/account/AccountPageHeader";
import { Button } from "@/components/ui/button";
import {
  listCommunicationBlocks,
  unblockSeller,
} from "@/lib/data/communication-blocks";
import { extractBasePath } from "@/lib/utils/path";

type BlockRow = {
  id: string;
  seller_id?: string | null;
  seller_name?: string | null;
  seller_slug?: string | null;
  created_at?: string;
};

export default function BlockedShopsPage() {
  const t = useTranslations("account");
  const tm = useTranslations("messages");
  const pathname = usePathname();
  const router = useRouter();
  const basePath = extractBasePath(pathname);
  const [rows, setRows] = useState<BlockRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    void listCommunicationBlocks().then((page) => {
      setRows(page.data as BlockRow[]);
      setLoading(false);
    });
  }, []);

  function handleUnblock(blockId: string) {
    startTransition(async () => {
      try {
        await unblockSeller(blockId);
        setRows((current) => current.filter((row) => row.id !== blockId));
        router.refresh();
      } catch {
        // silent — user can retry
      }
    });
  }

  return (
    <div>
      <AccountPageHeader
        title={t("blockedShopsTitle")}
        description={t("blockedShopsDescription")}
      />

      {loading ? (
        <p className="text-sm text-marketplace-muted-foreground">
          {t("loading")}
        </p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-marketplace-muted-foreground">
          {t("blockedShopsEmpty")}
        </p>
      ) : (
        <ul className="divide-y divide-marketplace-border-subtle rounded-[var(--marketplace-radius-md)] border border-marketplace-border-subtle bg-marketplace-surface">
          {rows.map((row) => (
            <li
              key={row.id}
              className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
            >
              <div>
                {row.seller_slug || row.seller_id ? (
                  <Link
                    href={`${basePath}/sellers/${row.seller_slug ?? row.seller_id}`}
                    className="font-medium text-marketplace-foreground hover:underline"
                  >
                    {row.seller_name ?? row.seller_slug ?? row.seller_id}
                  </Link>
                ) : (
                  <span className="font-medium text-marketplace-foreground">
                    {t("blockedShopUnknown")}
                  </span>
                )}
                {row.created_at ? (
                  <p className="mt-0.5 text-xs text-marketplace-muted-foreground">
                    {new Date(row.created_at).toLocaleDateString()}
                  </p>
                ) : null}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={pending}
                onClick={() => handleUnblock(row.id)}
              >
                {tm("unblock.action")}
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
