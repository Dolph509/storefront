import { getTranslations } from "next-intl/server";
import type { SellerShopPagePayload } from "@/lib/data/seller-storefront-types";
import { sellerShopShellClass } from "@/lib/utils/seller-storefront";
import { SellerAboutContent } from "./SellerAboutContent";
import { ShopEditorAction } from "./ShopEditorAction";

interface SellerStorefrontAboutProps {
  shopName: string;
  marketplaceName: string;
  tagline?: string | null;
  aboutHtml?: string | null;
  about?: string | null;
  salesCount?: number;
  sellerSince?: string | null;
  shopPage?: SellerShopPagePayload | null;
  editorPreview?: boolean;
}

export async function SellerStorefrontAbout({
  shopName,
  marketplaceName,
  tagline,
  aboutHtml,
  about,
  salesCount = 0,
  sellerSince,
  shopPage,
  editorPreview = false,
}: SellerStorefrontAboutProps) {
  const t = await getTranslations("sellers");
  const hasAbout = Boolean(aboutHtml?.trim() || about?.trim());

  const plainTextLength = aboutHtml
    ? aboutHtml.replace(/<[^>]+>/g, "").length
    : (about ?? "").length;
  const formattedSales =
    salesCount > 0 ? new Intl.NumberFormat().format(salesCount) : null;

  return (
    <section className="bg-[#faf9f7]">
      <div className={`${sellerShopShellClass} py-7 md:py-8`}>
        <div className="grid gap-6 lg:grid-cols-[minmax(11rem,14rem)_minmax(0,1fr)] lg:gap-x-12">
          <aside className="text-[#222]">
            <h2 className="text-sm font-semibold">
              {t("aboutShopHeading", { name: shopName })}
            </h2>
            <dl className="mt-4 space-y-3 text-xs">
              {formattedSales ? (
                <div>
                  <dt className="text-[#595959]">{t("aboutSalesLabel")}</dt>
                  <dd className="mt-0.5 font-medium tabular-nums text-[#222]">
                    {formattedSales}
                  </dd>
                </div>
              ) : null}
              {sellerSince ? (
                <div>
                  <dt className="text-[#595959]">
                    {t("aboutOnMarketplaceLabel", {
                      marketplace: marketplaceName,
                    })}
                  </dt>
                  <dd className="mt-0.5 font-medium text-[#222]">
                    {sellerSince.slice(0, 4)}
                  </dd>
                </div>
              ) : (
                <div>
                  <dt className="font-medium">
                    {t("aboutOnMarketplaceLabel", {
                      marketplace: marketplaceName,
                    })}
                  </dt>
                </div>
              )}
            </dl>
          </aside>

          <div className="min-w-0">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold text-[#222]">
                {shopPage?.story_headline || shopName}
              </h3>
              {editorPreview ? (
                <ShopEditorAction
                  action="shop-content"
                  label="Edit About, media and shop details"
                  className="inline-flex size-8 items-center justify-center rounded-sm text-marketplace-muted-foreground hover:bg-marketplace-surface-subtle hover:text-marketplace-foreground"
                />
              ) : null}
            </div>
            {tagline ? (
              <p className="mb-2 text-xs font-medium text-[#45342e]">
                {tagline}
              </p>
            ) : null}
            {aboutHtml ? (
              <SellerAboutContent
                html={aboutHtml}
                plainTextLength={plainTextLength}
                readMoreLabel={t("readMore")}
                readLessLabel={t("readLess")}
              />
            ) : hasAbout ? (
              <p className="max-w-3xl text-sm leading-relaxed text-[#222] whitespace-pre-wrap">
                {about}
              </p>
            ) : (
              <p className="max-w-3xl text-sm leading-relaxed text-[#595959]">
                {t("aboutEmpty")}
              </p>
            )}
          </div>
        </div>
        {shopPage?.video_url ||
        shopPage?.photos.length ||
        shopPage?.links.length ||
        editorPreview ? (
          <div className="mt-7 grid gap-5 border-t border-marketplace-border-subtle pt-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            {shopPage?.video_url ? (
              // biome-ignore lint/a11y/useMediaCaption: seller-provided WebVTT captions are optional.
              <video
                controls
                preload="metadata"
                className="max-h-[30rem] w-full rounded-sm bg-black"
                src={shopPage.video_url}
              >
                {shopPage.video_captions_url ? (
                  <track
                    kind="captions"
                    src={shopPage.video_captions_url}
                    srcLang="und"
                    label="Captions"
                    default
                  />
                ) : null}
              </video>
            ) : null}
            {shopPage?.photos.length ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {shopPage.photos.map((photo, index) => (
                  <figure key={`${photo.url}-${index}`} className="min-w-0">
                    {/* biome-ignore lint/performance/noImgElement: ActiveStorage shop story photos */}
                    <img
                      src={photo.url}
                      alt={photo.caption}
                      loading="lazy"
                      className="aspect-square w-full rounded-sm object-cover"
                    />
                    {photo.caption ? (
                      <figcaption className="mt-1 text-xs text-marketplace-muted-foreground">
                        {photo.caption}
                      </figcaption>
                    ) : null}
                  </figure>
                ))}
              </div>
            ) : null}
            {editorPreview &&
            !shopPage?.video_url &&
            !shopPage?.photos.length ? (
              <div className="flex min-h-24 items-center justify-between gap-4 rounded-sm border border-dashed border-marketplace-border px-4 py-3">
                <div>
                  <h3 className="text-sm font-semibold text-marketplace-foreground">
                    Shop photos and video
                  </h3>
                  <p className="mt-1 text-sm text-marketplace-muted-foreground">
                    Add a video and up to five photos to show your process and
                    workspace.
                  </p>
                </div>
                <ShopEditorAction
                  action="shop-content"
                  label="Add shop photos or video"
                  className="inline-flex size-8 shrink-0 items-center justify-center rounded-sm text-marketplace-muted-foreground hover:bg-marketplace-surface-subtle hover:text-marketplace-foreground"
                />
              </div>
            ) : null}
          </div>
        ) : null}
        {shopPage?.links.length || editorPreview ? (
          <nav
            aria-label="Shop links"
            className="mt-5 flex min-h-10 flex-wrap items-center gap-x-5 gap-y-2 text-sm"
          >
            {shopPage?.links.map((link) => (
              <a
                key={`${link.label}-${link.url}`}
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-2"
              >
                {link.label}
              </a>
            ))}
            {editorPreview ? (
              <ShopEditorAction
                action="shop-content"
                label="Edit shop links"
                className="inline-flex size-8 items-center justify-center rounded-sm text-marketplace-muted-foreground hover:bg-marketplace-surface-subtle hover:text-marketplace-foreground"
              />
            ) : null}
            {!shopPage?.links.length && editorPreview ? (
              <span className="text-marketplace-muted-foreground">
                Add a shop link
              </span>
            ) : null}
          </nav>
        ) : null}
        {shopPage?.member_bios.length || editorPreview ? (
          <section className="mt-7 border-t border-marketplace-border-subtle pt-6">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold">Shop members</h3>
              {editorPreview ? (
                <ShopEditorAction
                  action="shop-content"
                  label="Edit shop members"
                  className="inline-flex size-8 items-center justify-center rounded-sm text-marketplace-muted-foreground hover:bg-marketplace-surface-subtle hover:text-marketplace-foreground"
                />
              ) : null}
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {shopPage?.member_bios.map((member, index) => (
                <article key={`${member.name}-${index}`}>
                  <h4 className="text-sm font-medium">{member.name}</h4>
                  <p className="mt-1 text-sm leading-relaxed text-marketplace-muted-foreground">
                    {member.bio}
                  </p>
                </article>
              ))}
            </div>
            {!shopPage?.member_bios.length && editorPreview ? (
              <p className="text-sm text-marketplace-muted-foreground">
                Add a shop member and introduce the people behind your business.
              </p>
            ) : null}
          </section>
        ) : null}
        {shopPage?.faqs.length || editorPreview ? (
          <section className="mt-7 border-t border-marketplace-border-subtle pt-6">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold">
                Frequently asked questions
              </h3>
              {editorPreview ? (
                <ShopEditorAction
                  action="shop-content"
                  label="Edit frequently asked questions"
                  className="inline-flex size-8 items-center justify-center rounded-sm text-marketplace-muted-foreground hover:bg-marketplace-surface-subtle hover:text-marketplace-foreground"
                />
              ) : null}
            </div>
            <div className="divide-y divide-marketplace-border-subtle">
              {shopPage?.faqs.map((faq, index) => (
                <details key={`${faq.question}-${index}`} className="py-3">
                  <summary className="cursor-pointer text-sm font-medium">
                    {faq.question}
                  </summary>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-marketplace-muted-foreground">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
            {!shopPage?.faqs.length && editorPreview ? (
              <p className="text-sm text-marketplace-muted-foreground">
                Answer common questions about your products and shop.
              </p>
            ) : null}
          </section>
        ) : null}
        {(shopPage?.seller_details_public &&
          Object.values(shopPage.seller_details).some(Boolean)) ||
        editorPreview ? (
          <section className="mt-7 border-t border-marketplace-border-subtle pt-6">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold">Seller details</h3>
              {editorPreview ? (
                <ShopEditorAction
                  action="shop-content"
                  label="Edit seller details"
                  className="inline-flex size-8 items-center justify-center rounded-sm text-marketplace-muted-foreground hover:bg-marketplace-surface-subtle hover:text-marketplace-foreground"
                />
              ) : null}
            </div>
            {shopPage?.seller_details_public &&
            Object.values(shopPage.seller_details).some(Boolean) ? (
              <dl className="grid gap-3 text-sm sm:grid-cols-2">
                {Object.entries(shopPage.seller_details)
                  .filter(([, value]) => value)
                  .map(([key, value]) => (
                    <div key={key}>
                      <dt className="text-xs capitalize text-marketplace-muted-foreground">
                        {key.replaceAll("_", " ")}
                      </dt>
                      <dd className="mt-1 whitespace-pre-wrap">{value}</dd>
                    </div>
                  ))}
              </dl>
            ) : (
              <p className="text-sm text-marketplace-muted-foreground">
                Seller details are private unless you choose to display them.
              </p>
            )}
          </section>
        ) : null}
      </div>
    </section>
  );
}
