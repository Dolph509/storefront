"use server";

import { getCountry } from "@/lib/data/countries";

export async function giftFinderStates(iso: string) {
  if (!iso) return [];
  try {
    const country = await getCountry(iso);
    return (country.states ?? []).map((state) => ({
      abbr: state.abbr,
      name: state.name,
    }));
  } catch {
    return [];
  }
}
