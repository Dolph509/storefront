import { SpreeError } from "@spree/sdk";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { ThemePageRenderer } from "@/components/theme/ThemePageRenderer";
import { resolveCurrency } from "@/lib/data/markets";
import { getClient } from "@/lib/spree";
import type { HomeThemeContext } from "@/lib/theme/types";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

interface Props {
  params: Promise<{ country: string; locale: string; token: string }>;
}

export default async function ThemePreviewRoute({ params }: Props) {
  await connection();
  const { country, locale, token } = await params;
  const basePath = `/${country}/${locale}`;
  const currency = await resolveCurrency(country);

  let preview;
  try {
    preview = await getClient().cms.theme.preview.get(token);
  } catch (error) {
    if (error instanceof SpreeError && error.status === 404) notFound();
    throw error;
  }

  const context: HomeThemeContext = {
    kind: "home",
    basePath,
    locale,
    country,
    currency,
  };

  if (!preview.template) {
    return (
      <ThemePageRenderer
        theme={preview.theme}
        template={{
          id: "preview",
          template_type: "home",
          key: "default",
          full_key: "home.default",
          name: "Preview",
          data: { sections: {}, order: [] },
        }}
        context={context}
        chrome="full"
      />
    );
  }

  return (
    <ThemePageRenderer
      theme={preview.theme}
      template={preview.template}
      context={context}
      chrome="full"
    />
  );
}
