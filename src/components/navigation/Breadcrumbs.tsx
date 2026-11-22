import type { Category } from "@spree/sdk";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

interface BreadcrumbsProps {
  category?: Category | null;
  basePath: string;
  productName?: string;
  locale: string;
  centered?: boolean;
}

export async function Breadcrumbs({
  category,
  basePath,
  productName,
  locale,
  centered = false,
}: BreadcrumbsProps) {
  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "navigation",
  });
  const items = [{ name: t("home"), href: basePath }];

  if (category) {
    if (category.ancestors && category.ancestors.length > 0) {
      category.ancestors.forEach((ancestor) => {
        items.push({
          name: ancestor.name,
          href: `${basePath}/c/${ancestor.permalink}`,
        });
      });
    }

    if (productName) {
      items.push({
        name: category.name,
        href: `${basePath}/c/${category.permalink}`,
      });
      items.push({ name: productName, href: "" });
    } else {
      items.push({ name: category.name, href: "" });
    }
  } else if (productName) {
    items.push({ name: t("products"), href: `${basePath}/products` });
    items.push({ name: productName, href: "" });
  }

  return (
    <nav
      aria-label={t("breadcrumb")}
      className={
        centered ? "mb-1 flex justify-start md:mb-2 md:justify-center" : "mb-6"
      }
    >
      <ol
        className={`flex items-center gap-y-1 text-sm ${
          centered
            ? "min-w-0 flex-nowrap overflow-hidden text-xs text-[#6f6c68] md:flex-wrap md:justify-center"
            : "flex-wrap space-x-2"
        }`}
      >
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li
              key={index}
              className={
                centered
                  ? isLast
                    ? "flex min-w-0 items-center"
                    : "flex shrink-0 items-center whitespace-nowrap"
                  : "flex items-center"
              }
            >
              {index > 0 && (
                <ChevronRight
                  className={
                    centered
                      ? "mx-1.5 size-3.5 shrink-0 text-[#a6a19a]"
                      : "mx-2 h-4 w-4 text-gray-400"
                  }
                />
              )}
              {isLast ? (
                <span
                  className={
                    centered ? "truncate text-[#1a1a1a]" : "text-gray-500"
                  }
                  aria-current="page"
                >
                  {item.name}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className={
                    centered
                      ? "text-[#6f6c68] transition-colors hover:text-[#1a1a1a] hover:underline"
                      : "text-primary hover:text-primary/70"
                  }
                >
                  {item.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
