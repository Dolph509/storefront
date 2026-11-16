import Link from "next/link";
import type { CSSProperties } from "react";
import { type IconName, iconNames, SpreeIcon } from "@/components/icons";
import { FooterEmailSignup } from "@/components/layout/FooterEmailSignup";
import {
  type SocialNetwork,
  SocialPlatformIcon,
} from "@/components/layout/SocialPlatformIcon";
import { ProductCard } from "@/components/products/ProductCard";
import { ShopCard } from "@/components/shops/ShopCard";
import { CountdownTimer } from "@/components/theme/CountdownTimer";
import { ProductPageBlock } from "@/components/theme/resource/ProductPageBlocks";
import { SandboxedThemeCode } from "@/components/theme/SandboxedThemeCode";
import { ProductImage } from "@/components/ui/product-image";
import { cmsNavigationHref } from "@/lib/cms-navigation-href";
import { getCategory } from "@/lib/data/categories";
import { getPublishedNavigation } from "@/lib/data/cms-navigation";
import { getCollection } from "@/lib/data/collections";
import { getSeller } from "@/lib/data/sellers";
import { getClient, getLocaleOptions } from "@/lib/spree";
import { resolveThemeSetting } from "@/lib/theme/dynamic-source";
import { sanitizeThemeRichText } from "@/lib/theme/sanitize-rich-text";
import { themeSettingEnabled } from "@/lib/theme/setting-value";
import type { ThemeBlockInstance, ThemeRenderContext } from "@/lib/theme/types";

export function ThemeBlockRenderer({
  block,
  context,
  children,
  sectionType,
  blockId,
}: {
  block: ThemeBlockInstance;
  context: ThemeRenderContext;
  children?: React.ReactNode;
  sectionType?: string;
  blockId?: string;
}) {
  if (themeSettingEnabled(block.disabled)) return null;

  const settings = block.settings || {};
  if (
    [
      "media",
      "product_title",
      "price",
      "review_stars",
      "sku",
      "swatches",
      "buy_buttons",
      "description_tabs",
      "quick_order_list",
      "product_seller",
      "product_rating",
      "product_price",
      "product_variants",
      "product_buy_buttons",
      "product_inventory",
      "product_personalization",
      "product_proof",
      "product_quantity",
      "product_favorite",
      "product_custom_order",
    ].includes(block.type) &&
    context.kind === "product"
  ) {
    return (
      <ProductPageBlock
        type={block.type}
        product={context.product}
        settings={settings}
        cartDiscovery={context.cartDiscovery}
        basePath={context.basePath}
      />
    );
  }
  switch (block.type) {
    case "announcement": {
      const text = String(resolveThemeSetting(settings.text, context, ""));
      if (!text) return null;
      const link = typeof settings.link === "string" ? settings.link : "";
      const size = ["12px", "14px", "16px", "18px", "20px"].includes(
        String(settings.size),
      )
        ? String(settings.size)
        : "12px";
      const colors = { tight: "-0.02em", normal: "0", loose: "0.08em" };
      const weights: Record<string, number> = {
        default: 400,
        regular: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
      };
      const color =
        typeof settings.text_color === "string" &&
        /^#[0-9a-fA-F]{6}$/.test(settings.text_color)
          ? settings.text_color
          : undefined;
      const body = (
        <span
          style={{
            fontFamily:
              settings.font === "heading"
                ? "var(--font-display), serif"
                : undefined,
            fontSize: size,
            fontWeight: weights[String(settings.weight)] || 400,
            letterSpacing:
              colors[String(settings.letter_spacing) as keyof typeof colors] ||
              "0",
            textTransform:
              settings.text_case === "uppercase" ? "uppercase" : undefined,
            color,
          }}
        >
          {text}
        </span>
      );
      return link ? (
        <Link
          href={link.startsWith("/") ? link : `/${link}`}
          className="underline-offset-2 hover:underline"
        >
          {body}
        </Link>
      ) : (
        body
      );
    }
    case "heading": {
      const text = String(resolveThemeSetting(settings.text, context, ""));
      if (!text) return null;
      const level = ["div", "h1", "h2", "h3", "h4", "h5", "h6"].includes(
        String(settings.level),
      )
        ? String(settings.level)
        : "h2";
      const presetClasses: Record<string, string> = {
        heading_1: "text-4xl md:text-6xl",
        heading_2: "text-3xl md:text-4xl",
        heading_3: "text-2xl md:text-3xl",
        heading_4: "text-xl md:text-2xl",
      };
      const maxWidth: Record<string, string> = {
        narrow: "max-w-prose",
        normal: "max-w-3xl",
        wide: "max-w-5xl",
        full: "max-w-none",
      };
      const style = {
        border:
          settings.border_style === "solid"
            ? "1px solid var(--marketplace-border)"
            : undefined,
        borderRadius:
          typeof settings.corner_radius === "number"
            ? settings.corner_radius
            : undefined,
        paddingLeft: "var(--theme-heading-padding-x, 0px)",
        paddingRight: "var(--theme-heading-padding-x, 0px)",
        paddingTop: "var(--theme-heading-padding-y, 0px)",
        paddingBottom: "var(--theme-heading-padding-y, 0px)",
        "--theme-heading-padding-x": `${Number(settings.padding_x ?? settings.padding_left) || 0}px`,
        "--theme-heading-padding-y": `${Number(settings.padding_y ?? settings.padding_top) || 0}px`,
        "--theme-heading-mobile-padding-x": `${Number(settings.mobile_padding_x ?? settings.padding_x ?? settings.padding_left) || 0}px`,
        "--theme-heading-mobile-padding-y": `${Number(settings.mobile_padding_y ?? settings.padding_y ?? settings.padding_top) || 0}px`,
        marginBottom:
          typeof settings.margin_bottom === "number"
            ? settings.margin_bottom
            : undefined,
        backgroundColor: themeSettingEnabled(settings.background_enabled)
          ? typeof settings.background_color === "string" &&
            /^#[0-9a-fA-F]{6}$/.test(settings.background_color)
            ? settings.background_color
            : settings.background_color === "palette"
              ? "var(--marketplace-surface-warm)"
              : undefined
          : undefined,
      } as CSSProperties;
      const textColor =
        typeof settings.text_color === "string" &&
        /^#[0-9a-fA-F]{6}$/.test(settings.text_color)
          ? settings.text_color
          : settings.text_color === "palette"
            ? "var(--marketplace-foreground)"
            : undefined;
      const widthClass = settings.width === "fill" ? "w-full" : "w-fit";
      const hasCustomBackground = Boolean(style.backgroundColor);
      const HeadingTag = level as
        | "div"
        | "h1"
        | "h2"
        | "h3"
        | "h4"
        | "h5"
        | "h6";
      // The rich text editor wraps heading content in paragraphs. Paragraphs
      // are not valid children of heading elements, so keep inline formatting
      // while removing those editor-only wrappers before rendering.
      const headingHtml = sanitizeThemeRichText(text).replace(
        /<\/?(?:p|h[1-6])\b[^>]*>/gi,
        "",
      );
      const mobileStyle = {
        "--theme-heading-mobile-size":
          typeof settings.font_size_mobile === "number" &&
          settings.font_size_mobile > 0
            ? `${settings.font_size_mobile}px`
            : "inherit",
      } as CSSProperties;
      return (
        <>
          {settings.font_size_mobile ||
          settings.mobile_padding_x ||
          settings.mobile_padding_y ? (
            <style>{`@media (max-width: 767px) { .theme-slideshow-heading { font-size: var(--theme-heading-mobile-size); } .theme-slideshow-heading-wrapper { padding-left: var(--theme-heading-mobile-padding-x) !important; padding-right: var(--theme-heading-mobile-padding-x) !important; padding-top: var(--theme-heading-mobile-padding-y) !important; padding-bottom: var(--theme-heading-mobile-padding-y) !important; } }`}</style>
          ) : null}
          <div
            className={`theme-slideshow-heading-wrapper ${widthClass} ${maxWidth[String(settings.max_width)] || maxWidth.normal} ${hasCustomBackground ? "rounded-md" : ""} ${themeSettingEnabled(settings.hide_on_mobile) ? "max-md:hidden" : ""}`}
            style={style}
          >
            <HeadingTag
              role={level === "div" ? "heading" : undefined}
              aria-level={level === "div" ? 2 : undefined}
              className={`theme-slideshow-heading font-display font-semibold text-marketplace-brand ${presetClasses[String(settings.preset)] || presetClasses.heading_2}`}
              style={{
                ...mobileStyle,
                color: textColor,
                fontSize:
                  settings.preset === "custom_hd" &&
                  typeof settings.font_size === "number" &&
                  settings.font_size > 0
                    ? `${settings.font_size}px`
                    : undefined,
                fontWeight: Number(settings.font_weight) || undefined,
                lineHeight: Number(settings.line_height) || undefined,
                letterSpacing:
                  typeof settings.letter_spacing === "string"
                    ? settings.letter_spacing
                    : undefined,
                textTransform: themeSettingEnabled(settings.uppercase)
                  ? "uppercase"
                  : undefined,
              }}
              dangerouslySetInnerHTML={{ __html: headingHtml }}
            />
          </div>
        </>
      );
    }
    case "slide": {
      if (sectionType === "slideshow_split") {
        const images = [1, 2].map((index) => ({
          url: String(settings[`image_${index}_url`] || ""),
          alt: String(settings[`image_${index}_alt`] || ""),
          href: String(settings[`image_${index}_link`] || ""),
        }));
        const position = settings.position === "right" ? "right" : "left";
        const alignment =
          settings.alignment === "top"
            ? "justify-start"
            : settings.alignment === "bottom"
              ? "justify-end"
              : "justify-center";
        const background =
          typeof settings.background_color === "string" &&
          /^#[0-9a-fA-F]{6}$/.test(settings.background_color)
            ? settings.background_color
            : settings.background_color === "palette"
              ? "var(--marketplace-surface-warm)"
              : "#eeeeee";
        return (
          <div
            className="relative min-h-[420px] overflow-hidden"
            style={
              {
                backgroundColor: background,
                "--split-slide-gap": `${Number(settings.desktop_gap ?? 20)}px`,
                "--split-slide-mobile-gap": `${Number(settings.mobile_gap ?? 10)}px`,
              } as CSSProperties
            }
          >
            <style>
              {
                "[data-theme-split-slide-images]{gap:var(--split-slide-mobile-gap)} @media(min-width:768px){[data-theme-split-slide-images]{gap:var(--split-slide-gap)}}"
              }
            </style>
            <div
              data-theme-split-slide-images
              className="absolute inset-0 grid grid-cols-2"
            >
              {images.map((image, index) => {
                const content = image.url ? (
                  <img
                    data-theme-slide-image
                    src={image.url}
                    alt={image.alt}
                    className="size-full object-cover"
                  />
                ) : (
                  <div className="size-full" />
                );
                const safeHref =
                  (image.href.startsWith("/") &&
                    !image.href.startsWith("//")) ||
                  image.href.startsWith("https://")
                    ? image.href
                    : "";
                return (
                  <div key={index} className="min-w-0 overflow-hidden">
                    {safeHref ? (
                      <a
                        href={safeHref}
                        aria-label={image.alt || `Open image ${index + 1}`}
                        className="block size-full"
                      >
                        {content}
                      </a>
                    ) : (
                      content
                    )}
                  </div>
                );
              })}
            </div>
            {themeSettingEnabled(settings.background_gradient) ? (
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent"
              />
            ) : null}
            <div
              className={`absolute inset-y-0 z-10 flex w-full flex-col ${alignment} p-6 text-white md:w-1/2 md:p-12 ${position === "right" ? "md:right-0" : "md:left-0"}`}
            >
              {children}
            </div>
          </div>
        );
      }
      const source = String(settings.image_url || "");
      const focalPositions: Record<string, string> = {
        center: "center",
        top: "center top",
        bottom: "center bottom",
        left: "left center",
        right: "right center",
      };
      return (
        <div className="relative flex min-h-[300px] h-full items-center overflow-hidden rounded-lg bg-marketplace-surface-warm md:min-h-[480px]">
          {source ? (
            <img
              src={source}
              alt={String(settings.alt || "")}
              data-theme-slide-image
              className="absolute inset-0 size-full object-cover"
              style={{
                objectPosition:
                  focalPositions[String(settings.focal_point)] || "center",
              }}
            />
          ) : null}
          <div className="relative z-10 flex w-full flex-col gap-3 p-6 md:p-12">
            {children}
          </div>
        </div>
      );
    }
    case "slideshow_controls":
      return null;
    case "text": {
      const text = String(resolveThemeSetting(settings.text, context, ""));
      if (!text) return null;
      const presetClasses: Record<string, string> = {
        heading_1: "text-4xl md:text-6xl",
        heading_2: "text-3xl md:text-4xl",
        heading_3: "text-2xl md:text-3xl",
        heading_4: "text-xl md:text-2xl",
      };
      const maxWidths: Record<string, string> = {
        narrow: "max-w-prose",
        normal: "max-w-3xl",
        wide: "max-w-5xl",
        full: "max-w-none",
      };
      const width = settings.width === "fill" ? "w-full" : "w-fit";
      const customText = settings.preset === "custom";
      const style: CSSProperties = {
        paddingTop:
          typeof settings.padding_top === "number"
            ? settings.padding_top
            : undefined,
        paddingBottom:
          typeof settings.padding_bottom === "number"
            ? settings.padding_bottom
            : undefined,
        paddingLeft:
          typeof settings.padding_left === "number"
            ? settings.padding_left
            : undefined,
        paddingRight:
          typeof settings.padding_right === "number"
            ? settings.padding_right
            : undefined,
        backgroundColor: themeSettingEnabled(settings.background_enabled)
          ? typeof settings.background_color === "string" &&
            /^#[0-9a-fA-F]{6}$/.test(settings.background_color)
            ? settings.background_color
            : settings.background_color === "palette"
              ? "var(--marketplace-surface-warm)"
              : undefined
          : undefined,
        marginBottom: Number(settings.margin_bottom) || 0,
      };
      const textColor =
        typeof settings.text_color === "string" &&
        /^#[0-9a-fA-F]{6}$/.test(settings.text_color)
          ? settings.text_color
          : settings.text_color === "palette"
            ? "var(--marketplace-foreground)"
            : undefined;
      return (
        <>
          {blockId &&
          (customText ||
            themeSettingEnabled(settings.hide_breaks_on_mobile)) ? (
            <style>{`@media(max-width:767px){[data-theme-block-id="${blockId}"] .theme-slideshow-text{${customText && Number(settings.font_size_mobile) > 0 ? `font-size:${Number(settings.font_size_mobile)}px;` : ""}}${themeSettingEnabled(settings.hide_breaks_on_mobile) ? ` [data-theme-block-id="${blockId}"] .theme-slideshow-text br{display:none}` : ""}}`}</style>
          ) : null}
          <div
            className={`${width} ${maxWidths[String(settings.max_width)] || maxWidths.normal} ${themeSettingEnabled(settings.hide_on_mobile) ? "max-md:hidden" : ""}`}
            style={style}
          >
            <div
              className={`whitespace-pre-line ${textColor ? "" : "text-marketplace-muted-foreground"} ${customText ? "" : presetClasses[String(settings.preset)] || ""} ${themeSettingEnabled(settings.center_text) ? "text-center" : ""} theme-slideshow-text`}
              style={{
                color: textColor,
                fontSize:
                  customText && Number(settings.font_size) > 0
                    ? `${Number(settings.font_size)}px`
                    : undefined,
                fontWeight: customText
                  ? Number(settings.font_weight) || undefined
                  : undefined,
                lineHeight: customText
                  ? Number(settings.line_height) || undefined
                  : undefined,
              }}
              dangerouslySetInnerHTML={{ __html: sanitizeThemeRichText(text) }}
            />
          </div>
        </>
      );
    }
    case "image": {
      const source = String(settings.image_url || "");
      if (!source) return null;
      return (
        <img
          src={source}
          alt={String(settings.alt || "")}
          className="h-auto max-w-full object-cover"
        />
      );
    }
    case "image_banner": {
      const source = String(settings.image_url || "");
      if (!source) return null;
      const image = (
        <img
          src={source}
          alt={String(settings.alt || "")}
          className="h-auto w-full object-cover"
        />
      );
      const href = String(settings.link || "");
      return (
        <div className="relative overflow-hidden rounded-md">
          {href.startsWith("/") && !href.startsWith("//") ? (
            <Link href={href}>{image}</Link>
          ) : (
            image
          )}
          {settings.heading ? (
            <p className="absolute inset-x-4 bottom-4 rounded bg-white/90 p-3 font-semibold">
              {String(settings.heading)}
            </p>
          ) : null}
        </div>
      );
    }
    case "video": {
      const source = String(settings.video_url || "");
      if (!source) return null;
      return (
        <video
          controls
          playsInline
          preload="metadata"
          poster={
            typeof settings.poster_url === "string"
              ? settings.poster_url
              : undefined
          }
          className="h-auto max-w-full rounded-md"
        >
          <source src={source} />
          <track kind="captions" />
        </video>
      );
    }
    case "countdown": {
      const endAt = String(settings.end_at || "");
      return endAt ? (
        <CountdownTimer
          target={endAt}
          expiredText={String(settings.expired_text || "Offer ended")}
        />
      ) : null;
    }
    case "accordion":
      return (
        <details className="border-b border-marketplace-border py-3">
          <summary className="cursor-pointer font-medium">
            {String(settings.title || "Details")}
          </summary>
          <p className="pt-3 text-marketplace-muted-foreground">
            {String(settings.content || "")}
          </p>
        </details>
      );
    case "social_media": {
      const networks: SocialNetwork[] = [
        "instagram",
        "facebook",
        "pinterest",
        "tiktok",
        "youtube",
      ] as const;
      const links = networks.flatMap((network) => {
        const href =
          typeof settings[network] === "string"
            ? String(settings[network])
            : "";
        const safeHref = /^https:\/\//i.test(href) ? href : "";
        return safeHref ? [{ network, href: safeHref }] : [];
      });
      return links.length ? (
        <nav
          aria-label="Social media"
          data-theme-social-links
          className="flex flex-wrap items-center gap-4"
        >
          {links.map((link) => (
            <a
              key={link.network}
              aria-label={link.network[0].toUpperCase() + link.network.slice(1)}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex text-marketplace-muted-foreground transition-colors hover:text-marketplace-foreground"
            >
              <SocialPlatformIcon network={link.network} />
            </a>
          ))}
        </nav>
      ) : null;
    }
    case "email_signup":
      return (
        <FooterEmailSignup
          title={String(settings.heading || "Subscribe to our emails")}
          description={String(settings.description || "")}
          buttonLabel={String(settings.button_label || "Subscribe")}
          successText={String(
            settings.success_text || "Thanks for subscribing!",
          )}
        />
      );
    case "divider":
      return (
        <hr
          className="border-marketplace-border"
          style={{
            borderTopWidth: `${Math.max(1, Math.min(8, Number(settings.thickness) || 1))}px`,
          }}
        />
      );
    case "icon": {
      const requestedName = String(settings.name || "star");
      const iconName = (iconNames as readonly string[]).includes(requestedName)
        ? (requestedName as IconName)
        : "star";
      const iconSize =
        settings.size === "small" ? 16 : settings.size === "large" ? 32 : 24;
      return (
        <SpreeIcon
          name={iconName}
          size={iconSize}
          title={`${iconName} icon`}
          className="text-marketplace-brand"
          data-theme-icon={iconName}
        />
      );
    }
    case "popup_links": {
      const links = String(settings.links || "")
        .split("\n")
        .map((line) => line.split("|", 2));
      return (
        <details>
          <summary className="cursor-pointer">
            {String(settings.label || "More links")}
          </summary>
          <ul className="space-y-2 py-2">
            {links.map(([label, href]) =>
              href?.startsWith("/") && !href.startsWith("//") ? (
                <li key={`${label}-${href}`}>
                  <Link href={href}>{label}</Link>
                </li>
              ) : null,
            )}
          </ul>
        </details>
      );
    }
    case "custom_code":
      return (
        <SandboxedThemeCode
          code={String(settings.code || "")}
          context={context}
          title="Custom code block"
        />
      );
    case "group":
      return (
        <div
          className={
            settings.direction === "horizontal"
              ? "flex flex-wrap items-start"
              : "flex flex-col"
          }
          style={{
            gap:
              typeof settings.gap === "number" ? `${settings.gap}px` : "12px",
          }}
        >
          {children}
        </div>
      );
    case "button": {
      const label = String(resolveThemeSetting(settings.label, context, ""));
      const href = String(settings.link || context.basePath);
      if (!label) return null;
      const safeHref =
        href.startsWith("/") && !href.startsWith("//")
          ? href
          : href.startsWith("https://")
            ? href
            : context.basePath;
      const openInNewTab = themeSettingEnabled(settings.open_in_new_tab);
      const paletteStyle = String(settings.style || "custom");
      const backgroundColor =
        typeof settings.background_color === "string" &&
        /^#[0-9a-fA-F]{6}$/.test(settings.background_color)
          ? settings.background_color
          : undefined;
      const textColor =
        typeof settings.text_color === "string" &&
        /^#[0-9a-fA-F]{6}$/.test(settings.text_color)
          ? settings.text_color
          : undefined;
      const borderColor =
        typeof settings.border_color === "string" &&
        /^#[0-9a-fA-F]{6}$/.test(settings.border_color)
          ? settings.border_color
          : undefined;
      const sizeClass =
        settings.mobile_width === "custom"
          ? settings.desktop_width === "custom"
            ? "w-full md:w-full"
            : "w-full md:w-fit"
          : settings.desktop_width === "custom"
            ? "w-fit md:w-full"
            : "w-fit";
      const style: CSSProperties = {
        borderRadius:
          "var(--marketplace-button-radius, var(--marketplace-radius-md, 0.5rem))",
        backgroundColor:
          paletteStyle === "custom"
            ? backgroundColor ||
              (settings.background_color === "palette"
                ? "var(--marketplace-brand)"
                : undefined)
            : undefined,
        color:
          paletteStyle === "custom"
            ? textColor ||
              (settings.text_color === "palette" ? "white" : undefined)
            : undefined,
        borderColor:
          paletteStyle === "custom"
            ? borderColor ||
              (settings.border_color === "palette"
                ? "var(--marketplace-brand)"
                : undefined)
            : undefined,
      };
      const buttonStyle =
        paletteStyle === "primary"
          ? "bg-marketplace-brand text-white border-marketplace-brand"
          : paletteStyle === "secondary"
            ? "bg-marketplace-surface text-marketplace-brand border-marketplace-brand"
            : paletteStyle === "ghost"
              ? "border-transparent bg-transparent text-current"
              : paletteStyle === "outline"
                ? "border-current bg-transparent text-current"
                : "border";
      const buttonSize: Record<string, string> = {
        small: "px-3 py-2 text-sm",
        medium: "px-5 py-3",
        large: "px-7 py-4 text-lg",
      };
      return (
        <Link
          data-slot="button"
          data-variant={paletteStyle === "primary" ? "default" : paletteStyle}
          className={`inline-flex items-center justify-center rounded-md font-medium ${buttonSize[String(settings.size)] || buttonSize.medium} ${sizeClass} ${buttonStyle} ${themeSettingEnabled(settings.hide_on_mobile) ? "max-md:hidden" : ""} ${themeSettingEnabled(settings.hide_on_desktop) ? "md:hidden" : ""}`}
          href={safeHref}
          target={openInNewTab ? "_blank" : undefined}
          rel={openInNewTab ? "noopener noreferrer" : undefined}
          style={{
            ...style,
            marginBottom: Number(settings.margin_bottom) || 0,
          }}
        >
          {label}
        </Link>
      );
    }
    case "button_group": {
      const buttons = String(settings.buttons || "")
        .split("\n")
        .map((row) => row.split("|", 2))
        .filter(([label, href]) => Boolean(label?.trim() && href?.trim()));
      const alignment =
        settings.alignment === "center"
          ? "justify-center"
          : settings.alignment === "right"
            ? "justify-end"
            : "justify-start";
      const buttonClass =
        settings.style === "outline"
          ? "border border-current text-marketplace-brand"
          : settings.style === "secondary"
            ? "bg-marketplace-surface text-marketplace-foreground"
            : "bg-marketplace-brand text-white";
      return buttons.length ? (
        <div
          className={`flex flex-wrap ${alignment}`}
          style={{
            gap: `${Math.max(0, Math.min(80, Number(settings.gap) || 0))}px`,
          }}
        >
          {buttons.map(([label, href]) => {
            const safeHref =
              href.startsWith("/") && !href.startsWith("//")
                ? href
                : href.startsWith("https://")
                  ? href
                  : "";
            return safeHref ? (
              <Link
                key={`${label}-${safeHref}`}
                data-slot="button"
                data-variant={
                  settings.style === "outline"
                    ? "outline"
                    : settings.style === "secondary"
                      ? "secondary"
                      : "default"
                }
                href={safeHref}
                target={safeHref.startsWith("https://") ? "_blank" : undefined}
                rel={
                  safeHref.startsWith("https://")
                    ? "noopener noreferrer"
                    : undefined
                }
                className={`inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium ${buttonClass}`}
              >
                {label.trim()}
              </Link>
            ) : null;
          })}
        </div>
      ) : null;
    }
    case "product":
      return (
        <SelectedProductBlock
          productId={String(settings.product_id || "")}
          context={context}
        />
      );
    case "collection":
      return (
        <SelectedCollectionBlock
          collectionId={String(settings.collection_id || "")}
          heading={String(settings.heading || "")}
          context={context}
        />
      );
    case "shop":
      return (
        <SelectedShopsBlock
          sellerIds={
            Array.isArray(settings.seller_ids)
              ? settings.seller_ids.filter(
                  (id): id is string => typeof id === "string",
                )
              : []
          }
          context={context}
        />
      );
    case "menu":
      return (
        <SelectedMenuBlock
          menuKey={String(settings.menu_key || "")}
          context={context}
        />
      );
    case "icon_text":
      return (
        <div className="flex items-center gap-2">
          <SpreeIcon
            name={String(settings.icon || "star") as IconName}
            className="size-5 shrink-0 text-marketplace-brand"
          />
          <span>{String(settings.text || "")}</span>
        </div>
      );
    case "spacer": {
      const size = String(settings.size || "medium");
      const height =
        size === "small" ? "h-4" : size === "large" ? "h-12" : "h-8";
      return <div className={height} aria-hidden="true" />;
    }
    case "collection_sidebar_text":
      return settings.text || settings.heading ? (
        <section className="border-b border-marketplace-border pb-4">
          {settings.heading ? (
            <h3 className="mb-2 font-semibold text-marketplace-foreground">
              {String(settings.heading)}
            </h3>
          ) : null}
          {settings.text ? (
            <p className="whitespace-pre-line text-sm text-marketplace-muted-foreground">
              {String(settings.text)}
            </p>
          ) : null}
        </section>
      ) : null;
    case "collection_sidebar_image":
      return <CollectionSidebarImage settings={settings} />;
    case "collection_sidebar_promo":
      return <CollectionSidebarPromo settings={settings} />;
    case "collection_sidebar_products":
      return (
        <CollectionSidebarProducts settings={settings} context={context} />
      );
    case "collection_sidebar_collections":
      return (
        <CollectionSidebarCollections settings={settings} context={context} />
      );
    case "collection_sidebar_categories":
      return (
        <CollectionSidebarCategories settings={settings} context={context} />
      );
    case "collection_sidebar_filters":
      return null;
    case "collection_sidebar_divider": {
      const thickness = Math.max(
        0,
        Math.min(8, Number(settings.thickness) || 1),
      );
      const color =
        typeof settings.color === "string" &&
        /^#[0-9a-fA-F]{6}$/.test(settings.color)
          ? settings.color
          : "var(--marketplace-border)";
      return (
        <hr
          className="my-1 border-0"
          style={{ height: thickness, backgroundColor: color }}
        />
      );
    }
    case "collection_sidebar_spacer": {
      const height =
        settings.size === "small"
          ? "h-3"
          : settings.size === "large"
            ? "h-10"
            : "h-6";
      return <div className={height} aria-hidden="true" />;
    }
    default:
      if (process.env.NODE_ENV === "development") {
        console.warn(`[theme] unknown block type: ${block.type}`);
      }
      return null;
  }
}

function safeThemeBlockHref(value: unknown): string {
  if (typeof value !== "string") return "";
  return (value.startsWith("/") && !value.startsWith("//")) ||
    /^https:\/\//i.test(value)
    ? value
    : "";
}

function safeThemeBlockImage(value: unknown): string {
  return typeof value === "string" &&
    ((value.startsWith("/") && !value.startsWith("//")) ||
      /^https?:\/\//i.test(value))
    ? value
    : "";
}

function CollectionSidebarImage({
  settings,
}: {
  settings: Record<string, unknown>;
}) {
  const src = safeThemeBlockImage(settings.image_url);
  if (!src) return null;
  const image = (
    <img
      src={src}
      alt={String(settings.alt || "")}
      className="h-auto w-full rounded object-cover"
    />
  );
  const href = safeThemeBlockHref(settings.link);
  return href ? (
    <Link
      href={href}
      target={href.startsWith("https://") ? "_blank" : undefined}
      rel={href.startsWith("https://") ? "noopener noreferrer" : undefined}
    >
      {image}
    </Link>
  ) : (
    image
  );
}

function CollectionSidebarPromo({
  settings,
}: {
  settings: Record<string, unknown>;
}) {
  const src = safeThemeBlockImage(settings.image_url);
  const href = safeThemeBlockHref(settings.link);
  return (
    <section className="overflow-hidden rounded border border-marketplace-border">
      {src ? (
        <img src={src} alt="" className="aspect-[4/3] w-full object-cover" />
      ) : null}
      <div className="p-3">
        {settings.heading ? (
          <h3 className="font-semibold text-marketplace-foreground">
            {String(settings.heading)}
          </h3>
        ) : null}
        {settings.text ? (
          <p className="mt-1 text-sm text-marketplace-muted-foreground">
            {String(settings.text)}
          </p>
        ) : null}
        {href && settings.button_label ? (
          <Link
            href={href}
            className="mt-3 inline-flex text-sm font-medium text-marketplace-brand underline"
          >
            {String(settings.button_label)}
          </Link>
        ) : null}
      </div>
    </section>
  );
}

async function CollectionSidebarProducts({
  settings,
  context,
}: {
  settings: Record<string, unknown>;
  context: ThemeRenderContext;
}) {
  const selectedIds = Array.isArray(settings.product_ids)
    ? settings.product_ids
        .filter((id): id is string => typeof id === "string")
        .slice(0, 12)
    : [];
  if (!selectedIds.length) return null;
  const count = Math.max(1, Math.min(12, Number(settings.product_count) || 4));
  const options = await getLocaleOptions();
  const response = await getClient()
    .products.list(
      { id_in: selectedIds, limit: count, expand: ["seller", "media"] },
      options,
    )
    .catch(() => ({ data: [] }));
  const byId = new Map(response.data.map((product) => [product.id, product]));
  const products = selectedIds
    .flatMap((id) => byId.get(id) || [])
    .slice(0, count);
  if (!products.length) return null;
  return (
    <section>
      {settings.heading ? (
        <h3 className="mb-3 font-semibold text-marketplace-foreground">
          {String(settings.heading)}
        </h3>
      ) : null}
      <div className="flex flex-col gap-3">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            basePath={context.basePath}
            density="compact"
            currency={context.currency}
          />
        ))}
      </div>
    </section>
  );
}

async function CollectionSidebarCollections({
  settings,
  context,
}: {
  settings: Record<string, unknown>;
  context: ThemeRenderContext;
}) {
  const ids = Array.isArray(settings.collection_ids)
    ? settings.collection_ids
        .filter((id): id is string => typeof id === "string")
        .slice(0, 12)
    : [];
  const collections = (
    await Promise.all(ids.map((id) => getCollection(id).catch(() => null)))
  ).filter((item): item is NonNullable<typeof item> => item !== null);
  if (!collections.length) return null;
  return (
    <section>
      {settings.heading ? (
        <h3 className="mb-2 font-semibold text-marketplace-foreground">
          {String(settings.heading)}
        </h3>
      ) : null}
      <ul className="space-y-2">
        {collections.map((collection) => (
          <li key={collection.id}>
            <Link
              className="text-sm text-marketplace-foreground hover:underline"
              href={`${context.basePath}/collections/${collection.permalink}`}
            >
              {collection.name}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

async function CollectionSidebarCategories({
  settings,
  context,
}: {
  settings: Record<string, unknown>;
  context: ThemeRenderContext;
}) {
  const ids = Array.isArray(settings.category_ids)
    ? settings.category_ids
        .filter((id): id is string => typeof id === "string")
        .slice(0, 12)
    : [];
  const categories = (
    await Promise.all(ids.map((id) => getCategory(id).catch(() => null)))
  ).filter((item): item is NonNullable<typeof item> => item !== null);
  if (!categories.length) return null;
  return (
    <section>
      {settings.heading ? (
        <h3 className="mb-2 font-semibold text-marketplace-foreground">
          {String(settings.heading)}
        </h3>
      ) : null}
      <ul className="space-y-2">
        {categories.map((category) => (
          <li key={category.id}>
            <Link
              className="text-sm text-marketplace-foreground hover:underline"
              href={`${context.basePath}/c/${category.permalink}`}
            >
              {category.name}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

async function SelectedShopsBlock({
  sellerIds,
  context,
}: {
  sellerIds: string[];
  context: ThemeRenderContext;
}) {
  const sellers = await Promise.all(
    sellerIds.slice(0, 8).map((id) => getSeller(id).catch(() => null)),
  );
  const available = sellers.filter(
    (seller): seller is NonNullable<typeof seller> => Boolean(seller),
  );
  return available.length ? (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {available.map((seller) => (
        <ShopCard
          key={seller.id}
          seller={seller}
          basePath={context.basePath}
          locale={context.locale}
          variant="compact"
        />
      ))}
    </div>
  ) : null;
}

async function SelectedMenuBlock({
  menuKey,
  context,
}: {
  menuKey: string;
  context: ThemeRenderContext;
}) {
  if (!menuKey) return null;
  const menu = await getPublishedNavigation(menuKey);
  if (!menu) return null;
  const flatten = (
    items: typeof menu.items,
  ): Array<{ label: string; href: string }> =>
    items.flatMap((item) => {
      const href = cmsNavigationHref(item, context.basePath);
      return [
        ...(href ? [{ label: item.label, href }] : []),
        ...flatten(item.children ?? []),
      ];
    });
  const links = flatten(menu.items);
  return links.length ? (
    <nav
      aria-label={menu.key}
      data-theme-navigation-block
      className="flex flex-wrap gap-x-5 gap-y-2"
    >
      {links.map(({ label, href }) => (
        <Link
          key={`${label}-${href}`}
          href={href}
          className="text-sm text-marketplace-foreground hover:underline"
        >
          {label}
        </Link>
      ))}
    </nav>
  ) : null;
}

async function SelectedProductBlock({
  productId,
  context,
}: {
  productId: string;
  context: ThemeRenderContext;
}) {
  const selectedId =
    productId || (context.kind === "product" ? context.product.id : "");
  if (!selectedId) return null;
  try {
    const product =
      context.kind === "product" && context.product.id === selectedId
        ? context.product
        : await getClient().products.get(
            selectedId,
            { expand: ["seller", "media"] },
            await getLocaleOptions(),
          );
    return <ProductCard product={product} basePath={context.basePath} />;
  } catch {
    return null;
  }
}

async function SelectedCollectionBlock({
  collectionId,
  heading,
  context,
}: {
  collectionId: string;
  heading: string;
  context: ThemeRenderContext;
}) {
  const selectedId =
    collectionId || (context.kind === "collection" ? context.collectionId : "");
  if (!selectedId) return null;
  try {
    const collection = await getClient().collections.get(
      selectedId,
      undefined,
      await getLocaleOptions(),
    );
    const href = `${context.basePath}/collections/${collection.permalink || selectedId}`;
    const image =
      typeof collection.image_url === "string"
        ? collection.image_url
        : typeof collection.square_image_url === "string"
          ? collection.square_image_url
          : null;
    return (
      <article className="overflow-hidden rounded-md border border-marketplace-border">
        <Link href={href} className="block">
          {image ? (
            <div className="relative aspect-[4/3]">
              <ProductImage
                src={image}
                alt={collection.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            </div>
          ) : null}
          <div className="p-4">
            <h3 className="font-semibold">{heading || collection.name}</h3>
            {collection.description ? (
              <p className="mt-2 text-sm text-marketplace-muted-foreground">
                {collection.description}
              </p>
            ) : null}
          </div>
        </Link>
      </article>
    );
  } catch {
    return null;
  }
}
