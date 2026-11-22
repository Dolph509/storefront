import { isDeepStrictEqual } from "node:util";
import type { ThemeTemplateDocument } from "@spree/sdk";
import spreeHomeDefault from "./spree-6-home-default.json";

// Spree bootstraps this document even before an administrator opens the editor.
export function usesNativeHome(document?: ThemeTemplateDocument | null) {
  return (
    !document?.order?.length || isDeepStrictEqual(document, spreeHomeDefault)
  );
}
