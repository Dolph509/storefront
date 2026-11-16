import { getTranslations } from "next-intl/server";
import { sellerShopShellClass } from "@/lib/utils/seller-storefront";
import { SellerShopAnnouncementDialog } from "./SellerShopAnnouncementDialog";

interface SellerShopAnnouncementProps {
  shopAnnouncement?: string | null;
  shopAnnouncementHtml?: string | null;
}

export async function SellerShopAnnouncement({
  shopAnnouncement,
  shopAnnouncementHtml,
}: SellerShopAnnouncementProps) {
  const content = shopAnnouncementHtml || shopAnnouncement;
  if (!content) return null;

  const t = await getTranslations("sellers");
  const plainText = content.replace(/<[^>]*>/g, " ").replace(/&nbsp;/gi, " ");
  const canExpand = plainText.trim().length > 240;

  return (
    <section
      aria-labelledby="shop-announcement-title"
      className="border-y border-[#e3ddd8] bg-[#faf9f7]"
    >
      <div
        className={`${sellerShopShellClass} grid gap-3 py-5 sm:grid-cols-[11rem_minmax(0,1fr)] sm:gap-6 sm:py-7`}
      >
        <div>
          <h2
            id="shop-announcement-title"
            className="text-base font-semibold text-marketplace-foreground"
          >
            {t("announcementHeading")}
          </h2>
        </div>
        <div className="min-w-0">
          <div
            className={`prose prose-sm max-w-none text-[#514940] ${canExpand ? "max-h-24 overflow-hidden" : ""}`}
            dangerouslySetInnerHTML={{ __html: content }}
          />
          <SellerShopAnnouncementDialog
            title={t("announcementHeading")}
            content={content}
            canExpand={canExpand}
            readMoreLabel={t("readMore")}
            closeLabel={t("closeAnnouncement")}
          />
        </div>
      </div>
    </section>
  );
}
