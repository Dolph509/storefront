import { themeSectionGroupsEnabled } from "./flags";

/** Native React product page (Oddkeeps) on the classic PDP path when theme chrome is off. */
export function usesNativeProductPage(templateBlocks: unknown): boolean {
  if (templateBlocks !== undefined) return false;
  return !themeSectionGroupsEnabled();
}
