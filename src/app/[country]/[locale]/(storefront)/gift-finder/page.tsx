import type { Metadata } from "next";
import { connection } from "next/server";
import { getTranslations } from "next-intl/server";
import { GiftFinderExperience } from "@/components/gift-finder/GiftFinderExperience";
import { getCountries } from "@/lib/data/countries";
import {
  giftCatalogDepartments,
  giftCatalogIdeas,
} from "@/lib/data/gift-finder-catalog";
import { resolveCurrency } from "@/lib/data/markets";
import { getClient } from "@/lib/spree";

export const instant = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale: locale as "en" | "de" | "es" | "fr" | "pl",
    namespace: "giftFinder",
  });
  return { title: t("title"), description: t("intro") };
}

export default async function GiftFinderPage({
  params,
}: {
  params: Promise<{ country: string; locale: string }>;
}) {
  await connection();
  const { country, locale } = await params;
  const basePath = `/${country}/${locale}`;
  let options = null;
  try {
    options = await getClient().giftFinder.options({
      country,
      locale,
      cache: "no-store",
    });
  } catch {
    options = null;
  }

  const countries = await getCountries()
    .then((response) => response.data.map((item) => ({ iso: item.iso })))
    .catch(() => [{ iso: country.toUpperCase() }]);
  const currency =
    (await resolveCurrency(country).catch(() => undefined)) || "USD";

  if (!options) {
    const t = await getTranslations({
      locale: locale as "en" | "de" | "es" | "fr" | "pl",
      namespace: "giftFinder",
    });
    return (
      <main className="mx-auto max-w-3xl px-5 py-16">
        <h1 className="font-display text-3xl text-[#452C4F]">{t("title")}</h1>
        <p className="mt-3 text-[#452C4F]">{t("unavailable")}</p>
      </main>
    );
  }

  const departments = await giftCatalogDepartments(country, locale).catch(
    () => [],
  );
  const additional =
    departments.length < 3 ? await giftCatalogIdeas().catch(() => []) : [];
  const covers: Record<string, string> = {
    home_decor: "/marketplace/gift-edit-home.webp",
    jewelry: "/marketplace/gift-edit-jewelry.webp",
    art: "/marketplace/gift-edit-art.webp",
  };
  const illustratedInterests = options.interests.flatMap((interest) =>
    covers[interest.key]
      ? [{ label: interest.label, image: covers[interest.key] }]
      : [],
  );
  const ideas = new Map<string, { label: string; image: string | null }>();
  for (const idea of [...departments, ...additional, ...illustratedInterests]) {
    const key = idea.label.trim().toLowerCase();
    if (!ideas.has(key) || !ideas.get(key)?.image) ideas.set(key, idea);
  }
  const catalogIdeas = [...ideas.values()]
    .sort((a, b) => Number(Boolean(b.image)) - Number(Boolean(a.image)))
    .slice(0, 3);
  return (
    <main>
      <GiftFinderExperience
        catalogIdeas={catalogIdeas}
        options={options}
        countries={
          countries.length ? countries : [{ iso: country.toUpperCase() }]
        }
        country={country}
        locale={locale}
        currency={currency}
        basePath={basePath}
      />
    </main>
  );
}
