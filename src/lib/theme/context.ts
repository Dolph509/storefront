import type { ThemeRenderContext } from "./types";

export function chromeThemeContext(params: {
  basePath: string;
  locale: string;
  country: string;
  currency?: string;
}): ThemeRenderContext {
  return {
    kind: "home",
    basePath: params.basePath,
    locale: params.locale,
    country: params.country,
    currency: params.currency,
  };
}
