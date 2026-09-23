import { Megaphone as Announcement } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { sellerShopShellClass } from "@/lib/utils/seller-storefront";

interface SellerShopAnnouncementProps {
  shopAnnouncement?: string | null;
  shopAnnouncementHtml?: string | null;
}

export async function SellerShopAnnouncement({
  shopAnnouncement,
  shopAnnouncementHtml,
}: SellerShopAnnouncementProps) {
  if (!shopAnnouncementHtml && !shopAnnouncement) return null;

  const t = await getTranslations("sellers");

  return (
    <div className="border-b border-[#e8d5cc] bg-[#faf8f7]">
      <div className={sellerShopShellClass}>
        <div className="py-3 text-sm text-[#222]">
          <p className="mb-1.5 flex items-center gap-2 font-medium text-[#45342e]">
            <Announcement className="size-4 shrink-0" aria-hidden />
            {t("shopAnnouncementLabel")}
          </p>
          <div
            className="prose prose-sm max-w-none text-[#595959]"
            dangerouslySetInnerHTML={{
              __html: shopAnnouncementHtml || shopAnnouncement || "",
            }}
          />
        </div>
      </div>
    </div>
  );
}
