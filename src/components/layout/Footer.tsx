import type { Category } from "@spree/sdk";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import type { CSSProperties, ReactNode } from "react";
import { FooterContactForm } from "@/components/layout/FooterContactForm";
import { FooterEmailSignup } from "@/components/layout/FooterEmailSignup";
import { GlobalSocialLinks } from "@/components/layout/GlobalSocialLinks";
import { RegionPreferences } from "@/components/layout/RegionPreferences";
import {
  type CmsNavigationItemWire,
  cmsNavigationHref,
} from "@/lib/cms-navigation-href";
import {
  type CmsNavigationPayload,
  getPublishedNavigation,
} from "@/lib/data/cms-navigation";
import { isWholesaleEnabled } from "@/lib/spree";
import {
  getSellerOnboardingUrl,
  getSellerPanelUrl,
  getStoreDescription,
  getStoreName,
} from "@/lib/store";
import { themeSettingEnabled } from "@/lib/theme/setting-value";
import type { ThemeSectionInstance } from "@/lib/theme/types";
import { CurrentYear } from "./CurrentYear";
import { type SocialNetwork, SocialPlatformIcon } from "./SocialPlatformIcon";

const storeName = getStoreName();
const storeDescription = getStoreDescription();

interface FooterProps {
  basePath: string;
  locale: Locale;
  categoryLinks: ReactNode;
  section?: ThemeSectionInstance;
}

interface FooterCategoryLinksProps {
  rootCategories: Category[];
  basePath: string;
}

const linkClass =
  "text-sm text-marketplace-muted-foreground transition-colors hover:text-marketplace-foreground";

function parseFooterMenuLinks(
  value: unknown,
): Array<{ label: string; url: string }> {
  if (typeof value !== "string" || !value.trim()) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    if (Array.isArray(parsed))
      return parsed.filter((item): item is { label: string; url: string } =>
        Boolean(
          item &&
            typeof item === "object" &&
            "label" in item &&
            typeof item.label === "string" &&
            "url" in item &&
            typeof item.url === "string",
        ),
      );
  } catch {
    /* Older saved footer links use one Label|/path entry per line. */
  }
  return value
    .split(/\r?\n/)
    .map((line) => {
      const [label = "", ...url] = line.split("|");
      return { label: label.trim(), url: url.join("|").trim() };
    })
    .filter((link) => link.label || link.url);
}

function isLegacyFooterCopyright(block: {
  type?: string;
  settings?: Record<string, unknown>;
}) {
  return (
    block.type === "footer_text" &&
    /\{\{year\}\}|©|all rights reserved|rights reserved/i.test(
      String(block.settings?.text ?? ""),
    )
  );
}

function flattenNavigation(
  items: CmsNavigationItemWire[],
  basePath: string,
): Array<{ label: string; url: string }> {
  return items.flatMap((item) => {
    const href = cmsNavigationHref(item, basePath);
    const current = href ? [{ label: item.label, url: href }] : [];
    return [...current, ...flattenNavigation(item.children ?? [], basePath)];
  });
}

export function FooterCategoryLinks({
  rootCategories,
  basePath,
}: FooterCategoryLinksProps) {
  return rootCategories.slice(0, 4).map((category) => (
    <li key={category.id}>
      <Link href={`${basePath}/c/${category.permalink}`} className={linkClass}>
        {category.name}
      </Link>
    </li>
  ));
}

export async function Footer({
  basePath,
  locale,
  categoryLinks,
  section,
}: FooterProps) {
  const t = await getTranslations({ locale, namespace: "footer" });
  const tp = await getTranslations({ locale, namespace: "policies" });
  const sellerOnboardingUrl = getSellerOnboardingUrl();
  const sellerPanelUrl = getSellerPanelUrl();
  const hasSellerLinks = sellerOnboardingUrl || sellerPanelUrl;
  const settings = section?.settings ?? {};
  const customBlocks =
    section?.block_order
      .map((id) => ({ id, block: section.blocks[id] }))
      .filter((item) => item.block && !item.block.disabled) ?? [];
  const footerMenuKeys = section
    ? [
        String(settings.shop_menu_key ?? "footer_shop"),
        String(settings.sell_menu_key ?? "footer_sell"),
        String(settings.help_menu_key ?? "footer_help"),
        String(settings.marketplace_menu_key ?? "footer_marketplace"),
        ...customBlocks
          .filter(({ block }) => block.type === "footer_menu")
          .map(({ block }) => String(block.settings?.menu_key ?? ""))
          .filter(Boolean),
      ]
    : [];
  const footerNavigationEntries = await Promise.all(
    [...new Set(footerMenuKeys)].map(
      async (key) => [key, await getPublishedNavigation(key)] as const,
    ),
  );
  const footerNavigations = new Map<string, CmsNavigationPayload | null>(
    footerNavigationEntries,
  );
  const footerLinksFor = (key: string) => {
    const navigation = footerNavigations.get(key);
    return navigation ? flattenNavigation(navigation.items, basePath) : null;
  };
  const customMode =
    themeSettingEnabled(settings.footer_blocks_initialized) ||
    customBlocks.length > 0;
  const footerSchemes: Record<string, { background: string; text: string }> = {
    "scheme-1": { background: "#ffffff", text: "#111111" },
    "scheme-2": { background: "#f6f1e8", text: "#6c315d" },
    "scheme-3": { background: "#e8f4ef", text: "#173b32" },
    "scheme-4": { background: "#f0f3fa", text: "#24365f" },
    "scheme-5": { background: "#fff5e8", text: "#804a19" },
  };
  const footerScheme =
    footerSchemes[String(settings.color_scheme || "scheme-1")] ||
    footerSchemes["scheme-1"];
  const background =
    typeof settings.background_color === "string" &&
    /^#[0-9a-fA-F]{6}$/.test(settings.background_color)
      ? settings.background_color
      : footerScheme.background;
  const textColor =
    typeof settings.text_color === "string" &&
    /^#[0-9a-fA-F]{6}$/.test(settings.text_color)
      ? settings.text_color
      : footerScheme.text;
  const footerStyle: CSSProperties = {
    ...(background ? { backgroundColor: background } : {}),
    ...(textColor ? { color: textColor } : {}),
  };
  const sectionId = `theme-footer-${section?.section_id.replace(/[^a-zA-Z0-9_-]/g, "") ?? "default"}`;
  const cssInput =
    typeof settings.custom_css === "string" ? settings.custom_css : "";
  const customCss =
    /@import|url\s*\(|expression\s*\(|<\/style|javascript:/i.test(cssInput)
      ? ""
      : cssInput.replace(
          /([^{}]+)\{([^{}]*)\}/g,
          (_rule, selectors: string, declarations: string) => {
            if (selectors.trim().startsWith("@")) return "";
            return `${selectors
              .split(",")
              .map((selector) => `#${sectionId} ${selector.trim()}`)
              .join(", ")} {${declarations}}`;
          },
        );
  const maxWidth =
    settings.section_width === "full"
      ? "none"
      : "var(--marketplace-page-width, 1200px)";
  const gap = Math.max(0, Math.min(80, Number(settings.gap ?? 24)));
  const footerPadding: CSSProperties = {
    maxWidth,
    paddingTop: `${Math.max(0, Math.min(120, Number(settings.padding_top ?? 48)))}px`,
    paddingBottom: `${Math.max(0, Math.min(120, Number(settings.padding_bottom ?? 48)))}px`,
  };
  const copyrights = customBlocks.filter(
    ({ block }) =>
      block.type === "footer_copyright" || isLegacyFooterCopyright(block),
  );
  const paymentIcons = customBlocks.filter(
    ({ block }) => block.type === "footer_payment_icons",
  );

  return (
    <footer
      id={sectionId}
      data-theme-footer
      data-theme-base-path={basePath}
      className="border-t border-marketplace-border-subtle bg-marketplace-surface-warm text-marketplace-foreground"
      style={footerStyle}
    >
      {customCss && <style>{customCss}</style>}
      <div
        data-theme-footer-content
        className="mx-auto max-w-[1440px] px-4 pb-28 sm:px-6 md:pb-12 lg:px-8"
        style={footerPadding}
      >
        <div
          data-theme-footer-layout
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6"
          style={{ columnGap: `${gap}px`, rowGap: `${gap}px` }}
        >
          {customMode ? (
            customBlocks
              .filter(
                ({ block }) =>
                  block.type !== "footer_copyright" &&
                  block.type !== "footer_payment_icons" &&
                  !isLegacyFooterCopyright(block),
              )
              .map(({ id, block }) => {
                const blockSettings = block.settings ?? {};
                if (block.type === "footer_brand") {
                  const title =
                    String(blockSettings.title ?? "").trim() || storeName;
                  const description =
                    "description" in blockSettings
                      ? String(blockSettings.description ?? "").trim()
                      : storeDescription;
                  return (
                    <div
                      key={id}
                      data-theme-footer-block-id={id}
                      data-theme-footer-block-type={block.type}
                      className="col-span-2 md:col-span-3 lg:col-span-6"
                    >
                      <span
                        data-theme-footer-brand-title
                        className="block max-w-xl font-display text-3xl font-normal leading-tight text-[#222] md:text-4xl"
                      >
                        {title}
                      </span>
                      {description && (
                        <p
                          data-theme-footer-brand-description
                          className="mt-3 max-w-sm text-sm leading-6 text-marketplace-muted-foreground"
                        >
                          {description}
                        </p>
                      )}
                    </div>
                  );
                }
                if (block.type === "footer_menu") {
                  const title =
                    String(blockSettings.title ?? "Links").trim() || "Links";
                  const navigation = footerNavigations.get(
                    String(blockSettings.menu_key ?? ""),
                  );
                  const links = navigation
                    ? flattenNavigation(navigation.items, basePath)
                    : parseFooterMenuLinks(blockSettings.links);
                  return (
                    <FooterGroup
                      key={id}
                      title={title}
                      dataBlockId={id}
                      dataMenuKey={String(blockSettings.menu_key ?? "")}
                    >
                      {links.map(({ label, url }) => {
                        const target = url.trim();
                        const resolvedHref =
                          target.startsWith("/") || /^https:\/\//i.test(target)
                            ? target
                            : `${basePath}/${target}`;
                        return (
                          <li key={`${label}-${target}`}>
                            <Link href={resolvedHref} className={linkClass}>
                              {label.trim()}
                            </Link>
                          </li>
                        );
                      })}
                    </FooterGroup>
                  );
                }
                if (block.type === "footer_text") {
                  const title = String(blockSettings.title ?? "").trim();
                  const text = String(blockSettings.text ?? "").trim();
                  return (
                    <div
                      key={id}
                      data-theme-footer-block-id={id}
                      data-theme-footer-block-type={block.type}
                      className="min-w-0"
                    >
                      {title && (
                        <h2 className="text-sm font-semibold">{title}</h2>
                      )}
                      {text && (
                        <p className="mt-3 whitespace-pre-line text-sm leading-6 text-marketplace-muted-foreground">
                          {text}
                        </p>
                      )}
                    </div>
                  );
                }
                if (block.type === "footer_social") {
                  const title = String(
                    blockSettings.title ?? "Follow us",
                  ).trim();
                  const links = (
                    [
                      "instagram",
                      "facebook",
                      "pinterest",
                      "tiktok",
                      "youtube",
                    ] as const
                  ).filter(
                    (key) =>
                      typeof blockSettings[key] === "string" &&
                      /^https:\/\//i.test(String(blockSettings[key]).trim()),
                  );
                  return (
                    <FooterSocialGroup
                      key={id}
                      title={title}
                      dataBlockId={id}
                      dataBlockType={block.type}
                      links={links.map((network) => ({
                        network,
                        href: String(blockSettings[network]).trim(),
                      }))}
                    />
                  );
                }
                if (block.type === "footer_follow_on_shop") {
                  const title = String(
                    blockSettings.title ?? "Follow on Shop",
                  ).trim();
                  const href = String(blockSettings.link ?? "/shops");
                  return (
                    <div
                      key={id}
                      data-theme-footer-block-id={id}
                      data-theme-footer-block-type={block.type}
                    >
                      <Link
                        href={href}
                        className="inline-flex rounded-md border border-marketplace-border px-3 py-2 text-sm font-medium hover:bg-white"
                      >
                        {title}
                      </Link>
                    </div>
                  );
                }
                if (block.type === "footer_policy_links") {
                  const title =
                    String(blockSettings.title ?? "Policies").trim() ||
                    "Policies";
                  const links = parseFooterMenuLinks(blockSettings.links);
                  return (
                    <FooterGroup
                      key={id}
                      title={title}
                      dataBlockId={id}
                      dataBlockType={block.type}
                    >
                      {links.map(({ label, url }) => (
                        <li key={`${label}-${url}`}>
                          <Link
                            href={
                              url.startsWith("/") || /^https:\/\//i.test(url)
                                ? url
                                : `${basePath}/${url}`
                            }
                            className={linkClass}
                          >
                            {label}
                          </Link>
                        </li>
                      ))}
                    </FooterGroup>
                  );
                }
                if (block.type === "footer_social_links") {
                  const title = String(
                    blockSettings.title ?? "Follow us",
                  ).trim();
                  const links = (
                    [
                      "instagram",
                      "facebook",
                      "pinterest",
                      "tiktok",
                      "youtube",
                    ] as const
                  ).filter(
                    (key) =>
                      typeof blockSettings[key] === "string" &&
                      /^https:\/\//i.test(String(blockSettings[key]).trim()),
                  );
                  return (
                    <FooterSocialGroup
                      key={id}
                      title={title}
                      dataBlockId={id}
                      dataBlockType={block.type}
                      links={links.map((network) => ({
                        network,
                        href: String(blockSettings[network]).trim(),
                      }))}
                    />
                  );
                }
                if (block.type === "footer_contact_form")
                  return (
                    <div key={id} data-theme-footer-block-id={id}>
                      <FooterContactForm
                        title={String(blockSettings.title ?? "Contact us")}
                        description={String(blockSettings.description ?? "")}
                        recipientEmail={String(
                          blockSettings.recipient_email ?? "",
                        )}
                        submitLabel={String(
                          blockSettings.submit_label ?? "Send message",
                        )}
                      />
                    </div>
                  );
                if (block.type === "footer_email_signup")
                  return (
                    <div key={id} data-theme-footer-block-id={id}>
                      <FooterEmailSignup
                        title={String(
                          blockSettings.title ?? "Subscribe to our emails",
                        )}
                        description={String(blockSettings.description ?? "")}
                        buttonLabel={String(
                          blockSettings.button_label ?? "Subscribe",
                        )}
                        successText={String(
                          blockSettings.success_text ??
                            "Thanks for subscribing!",
                        )}
                      />
                    </div>
                  );
                return null;
              })
          ) : (
            <>
              <div className="col-span-2 md:col-span-3 lg:col-span-2">
                <span className="text-xl font-semibold">{storeName}</span>
                <p className="mt-3 max-w-sm text-sm leading-6 text-marketplace-muted-foreground">
                  {storeDescription}
                </p>
              </div>

              <FooterGroup title={t("shop")}>
                {footerLinksFor(
                  String(settings.shop_menu_key ?? "footer_shop"),
                )?.map(({ label, url }) => (
                  <li key={`${label}-${url}`}>
                    <Link href={url} className={linkClass}>
                      {label}
                    </Link>
                  </li>
                )) ?? (
                  <>
                    <li>
                      <Link href={`${basePath}/products`} className={linkClass}>
                        {t("allProducts")}
                      </Link>
                    </li>
                    <li>
                      <Link href={`${basePath}/shops`} className={linkClass}>
                        {t("shops")}
                      </Link>
                    </li>
                    {categoryLinks}
                    {isWholesaleEnabled() ? (
                      <li>
                        <Link
                          href={`${basePath}/wholesale`}
                          className={linkClass}
                        >
                          {t("wholesale")}
                        </Link>
                      </li>
                    ) : null}
                  </>
                )}
              </FooterGroup>

              {hasSellerLinks ||
              footerLinksFor(
                String(settings.sell_menu_key ?? "footer_sell"),
              ) ? (
                <FooterGroup title={t("sell")}>
                  {footerLinksFor(
                    String(settings.sell_menu_key ?? "footer_sell"),
                  )?.map(({ label, url }) => (
                    <li key={`${label}-${url}`}>
                      <Link href={url} className={linkClass}>
                        {label}
                      </Link>
                    </li>
                  ))}
                  {!footerLinksFor(
                    String(settings.sell_menu_key ?? "footer_sell"),
                  ) && (
                    <>
                      {sellerOnboardingUrl ? (
                        <li>
                          <Link
                            href={sellerOnboardingUrl}
                            className={linkClass}
                          >
                            {t("sellOnMarketplace", { marketplace: storeName })}
                          </Link>
                        </li>
                      ) : null}
                      {sellerPanelUrl ? (
                        <li>
                          <Link href={sellerPanelUrl} className={linkClass}>
                            {t("sellerSignIn")}
                          </Link>
                        </li>
                      ) : null}
                    </>
                  )}
                </FooterGroup>
              ) : null}

              <FooterGroup title={t("help")}>
                {footerLinksFor(
                  String(settings.help_menu_key ?? "footer_help"),
                )?.map(({ label, url }) => (
                  <li key={`${label}-${url}`}>
                    <Link href={url} className={linkClass}>
                      {label}
                    </Link>
                  </li>
                )) ?? (
                  <>
                    <li>
                      <Link
                        href={`${basePath}/account/orders`}
                        className={linkClass}
                      >
                        {t("ordersAndHelp")}
                      </Link>
                    </li>
                    <li>
                      <Link
                        href={`${basePath}/policies/shipping-policy`}
                        className={linkClass}
                      >
                        {tp("shippingPolicy")}
                      </Link>
                    </li>
                    <li>
                      <Link
                        href={`${basePath}/policies/returns-policy`}
                        className={linkClass}
                      >
                        {tp("returnsPolicy")}
                      </Link>
                    </li>
                  </>
                )}
              </FooterGroup>

              <FooterGroup title={t("marketplace")}>
                {footerLinksFor(
                  String(settings.marketplace_menu_key ?? "footer_marketplace"),
                )?.map(({ label, url }) => (
                  <li key={`${label}-${url}`}>
                    <Link href={url} className={linkClass}>
                      {label}
                    </Link>
                  </li>
                )) ?? (
                  <>
                    <li>
                      <Link
                        href={`${basePath}/policies/privacy-policy`}
                        className={linkClass}
                      >
                        {tp("privacyPolicy")}
                      </Link>
                    </li>
                    <li>
                      <Link
                        href={`${basePath}/policies/terms-of-service`}
                        className={linkClass}
                      >
                        {tp("termsOfService")}
                      </Link>
                    </li>
                  </>
                )}
              </FooterGroup>
            </>
          )}
        </div>

        {!customMode ? <GlobalSocialLinks /> : null}

        <div
          data-theme-footer-bottom
          className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-marketplace-border pt-6"
        >
          <div
            data-theme-footer-region
            className="flex flex-wrap items-center gap-4 text-sm"
          >
            <RegionPreferences variant="menu" />
            <div
              data-theme-footer-copyright
              className="flex flex-wrap gap-x-2 text-xs text-marketplace-muted-foreground"
              style={{
                display: customMode && !copyrights.length ? "none" : undefined,
              }}
            >
              {copyrights.length ? (
                copyrights.map(({ id, block }) => (
                  <p key={id} data-theme-footer-copyright-block-id={id}>
                    {String(block.settings.text ?? "")
                      .replace("{{year}}", String(new Date().getFullYear()))
                      .replace("{{store}}", storeName)
                      .replace("All rights reserved.", t("rightsReserved"))}
                  </p>
                ))
              ) : (
                <p>
                  &copy; <CurrentYear /> {storeName}. {t("rightsReserved")}
                </p>
              )}
            </div>
          </div>
          <div
            data-theme-footer-payment-icons
            className="ml-auto flex flex-wrap items-end justify-end gap-3"
            style={{ display: paymentIcons.length ? undefined : "none" }}
          >
            {paymentIcons.map(({ id, block }) => (
              <div
                key={id}
                data-theme-footer-payment-block-id={id}
                className="flex flex-col items-end gap-2"
              >
                {String(block.settings.title ?? "").trim() && (
                  <p className="text-xs text-marketplace-muted-foreground">
                    {String(block.settings.title).trim()}
                  </p>
                )}
                <ul
                  aria-label={String(
                    block.settings.title ?? "Accepted payment methods",
                  )}
                  className="flex flex-wrap justify-end gap-2"
                >
                  {String(block.settings.payment_methods ?? "")
                    .split(/,|\r?\n/)
                    .map((method) => method.trim())
                    .filter(Boolean)
                    .map((method) => (
                      <PaymentMethodMark key={method} method={method} />
                    ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterSocialGroup({
  title,
  dataBlockId,
  dataBlockType,
  links,
}: {
  title: string;
  dataBlockId: string;
  dataBlockType: string;
  links: Array<{ network: SocialNetwork; href: string }>;
}) {
  return (
    <div
      data-theme-footer-block-id={dataBlockId}
      data-theme-footer-block-type={dataBlockType}
    >
      <h2 className="text-sm font-semibold">{title}</h2>
      <ul className="mt-4 flex flex-wrap items-center gap-4">
        {links.map(({ network, href }) => (
          <li key={network}>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={network[0].toUpperCase() + network.slice(1)}
              className={linkClass}
            >
              <SocialPlatformIcon network={network} />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PaymentMethodMark({ method }: { method: string }) {
  const normalized = method.toLowerCase().replace(/[^a-z]/g, "");
  const wordmark: Record<string, string> = {
    visa: "#1a1f71",
    mastercard: "#eb001b",
    americanexpress: "#006fcf",
    amex: "#006fcf",
    paypal: "#003087",
    applepay: "#111111",
    googlepay: "#4285f4",
    klarna: "#111111",
    discover: "#222222",
  };
  const color = wordmark[normalized] || "#30343b";
  const isMastercard = normalized === "mastercard";
  return (
    <li
      aria-label={method}
      title={method}
      className="flex h-8 min-w-12 items-center justify-center rounded-md border border-marketplace-border bg-white px-2 text-[11px] font-extrabold tracking-tight shadow-sm"
      style={{ color }}
    >
      {isMastercard ? (
        <span className="flex items-center" aria-hidden="true">
          <i className="-mr-1.5 h-4 w-4 rounded-full bg-[#eb001b]" />
          <i className="h-4 w-4 rounded-full bg-[#f79e1b]/95" />
        </span>
      ) : normalized === "visa" ? (
        <span className="italic">VISA</span>
      ) : normalized === "americanexpress" || normalized === "amex" ? (
        <span className="bg-[#006fcf] px-1 py-1 text-[8px] leading-none text-white">
          AMEX
        </span>
      ) : normalized === "paypal" ? (
        <span className="italic">
          <b className="text-[#003087]">P</b>
          <b className="-ml-1 text-[#009cde]">P</b>
          <span className="ml-0.5 font-semibold not-italic">PayPal</span>
        </span>
      ) : normalized === "applepay" ? (
        <span className="inline-flex items-center gap-0.5 font-semibold tracking-tight">
          <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            className="h-4 w-4 fill-current"
          >
            <path d="M16.6 10.7c0-2.1 1.7-3.1 1.8-3.2-1-1.5-2.6-1.7-3.2-1.7-1.4-.1-2.7.8-3.4.8-.7 0-1.8-.8-3-.8-1.5 0-2.9.9-3.7 2.2-1.6 2.7-.4 6.7 1.1 8.9.7 1.1 1.5 2.3 2.6 2.2 1-.1 1.4-.7 2.7-.7 1.2 0 1.6.7 2.7.7 1.1 0 1.8-1.1 2.5-2.2.8-1.2 1.1-2.4 1.1-2.5-.1 0-2.2-.9-2.2-3.7ZM14.4 4.4c.6-.8 1-1.8.9-2.9-.9 0-2 .6-2.6 1.4-.6.7-1.1 1.8-1 2.8 1 0 2-.5 2.7-1.3Z" />
          </svg>
          Pay
        </span>
      ) : normalized === "googlepay" ? (
        <span className="font-medium">
          <span className="text-[#4285f4]">G</span>
          <span className="text-[#ea4335]">o</span>
          <span className="text-[#fbbc05]">o</span>
          <span className="text-[#4285f4]">g</span>
          <span className="text-[#34a853]">l</span>
          <span className="text-[#ea4335]">e</span> Pay
        </span>
      ) : normalized === "klarna" ? (
        <span className="rounded-sm bg-[#ffb3c7] px-1.5 py-1 text-black">
          Klarna.
        </span>
      ) : (
        method
      )}
    </li>
  );
}

function FooterGroup({
  title,
  children,
  dataBlockId,
  dataBlockType = "footer_menu",
  dataMenuKey,
}: {
  title: string;
  children: ReactNode;
  dataBlockId?: string;
  dataBlockType?: string;
  dataMenuKey?: string;
}) {
  return (
    <div
      data-theme-footer-block-id={dataBlockId}
      data-theme-footer-block-type={dataBlockId ? dataBlockType : undefined}
      data-theme-footer-menu-key={dataMenuKey}
    >
      <h2 className="text-sm font-semibold">{title}</h2>
      <ul className="mt-4 space-y-3">{children}</ul>
    </div>
  );
}
