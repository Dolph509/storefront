"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState, useTransition } from "react";
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
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        {t("blockedShopsTitle")}
      </h1>
      <p className="text-sm text-gray-600 mb-6">
        {t("blockedShopsDescription")}
      </p>

      {loading ? (
        <p className="text-sm text-gray-500">{t("loading")}</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-gray-500">{t("blockedShopsEmpty")}</p>
      ) : (
        <ul className="divide-y divide-gray-200 rounded-xl border border-gray-200 bg-white">
          {rows.map((row) => (
            <li
              key={row.id}
              className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
            >
              <div>
                {row.seller_slug || row.seller_id ? (
                  <Link
                    href={`${basePath}/sellers/${row.seller_slug ?? row.seller_id}`}
                    className="font-medium text-gray-900 hover:underline"
                  >
                    {row.seller_name ?? row.seller_slug ?? row.seller_id}
                  </Link>
                ) : (
                  <span className="font-medium text-gray-900">
                    {t("blockedShopUnknown")}
                  </span>
                )}
                {row.created_at ? (
                  <p className="text-xs text-gray-500 mt-0.5">
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
