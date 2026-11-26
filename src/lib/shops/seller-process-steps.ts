export type SellerProcessStep = {
  imageUrl: string;
  title: string;
  body: string;
};

/**
 * Builds process steps from captioned shop-page photos.
 * Returns an empty list when there are fewer than two usable steps.
 */
export function buildSellerProcessSteps(
  photos:
    | Array<{ url?: string | null; caption?: string | null }>
    | null
    | undefined,
  limit = 4,
): SellerProcessStep[] {
  const steps = (photos ?? [])
    .map((photo) => {
      const imageUrl = photo.url?.trim() ?? "";
      const caption = photo.caption?.trim() ?? "";
      if (!imageUrl || !caption) return null;

      const sentenceBreak = caption.search(/[.!?:—–-]\s/);
      let title = caption;
      let body = "";
      if (sentenceBreak > 0 && sentenceBreak < 48) {
        title = caption
          .slice(0, sentenceBreak)
          .replace(/[.!?:—–-]+$/, "")
          .trim();
        body = caption.slice(sentenceBreak + 1).trim();
      } else if (caption.length > 42) {
        const cut = caption.lastIndexOf(" ", 40);
        title = caption.slice(0, cut > 12 ? cut : 40).trim();
        body = caption.slice(title.length).trim();
      }

      if (!title) return null;
      return { imageUrl, title, body: body || caption };
    })
    .filter((step): step is SellerProcessStep => Boolean(step))
    .slice(0, limit);

  return steps.length >= 2 ? steps : [];
}

export function sellerHasProcessSection(
  photos:
    | Array<{ url?: string | null; caption?: string | null }>
    | null
    | undefined,
): boolean {
  return buildSellerProcessSteps(photos).length >= 2;
}
