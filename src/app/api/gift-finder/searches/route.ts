import { type GiftFinderSearchParams, SpreeError } from "@spree/sdk";
import {
  getAuthOptions,
  getClient,
  getLocaleOptions,
  withAuthRefresh,
} from "@/lib/spree";

type SearchBody = GiftFinderSearchParams & {
  market_country?: string;
  market_locale?: string;
  market_currency?: string;
};

export async function POST(request: Request) {
  let body: SearchBody;
  try {
    body = (await request.json()) as SearchBody;
  } catch {
    return Response.json(
      { message: "The gift search could not be read." },
      { status: 400 },
    );
  }

  if (request.signal.aborted) {
    return new Response(null, { status: 499 });
  }

  const { market_country, market_locale, market_currency, ...params } = body;
  const localeOptions = await getLocaleOptions();
  const country = market_country || localeOptions.country;
  const locale = market_locale || localeOptions.locale;
  const auth = await getAuthOptions();

  const search = (options: { token?: string }) =>
    getClient().giftFinder.searches.create(params, {
      country,
      locale,
      currency: market_currency,
      cache: "no-store",
      ...options,
    });

  try {
    const result = auth.token
      ? await withAuthRefresh((options) => search(options))
      : await search({});
    return Response.json(result);
  } catch (error) {
    if (error instanceof SpreeError) {
      return Response.json(
        { message: error.message, code: error.code },
        { status: error.status || 422 },
      );
    }
    return Response.json(
      { message: "Gift search is unavailable right now." },
      { status: 503 },
    );
  }
}
