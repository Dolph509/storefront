/** PDP placeholder when a product has no published reviews yet. */
export function ProductReviewsEmptyState({
  heading,
  description,
}: {
  heading: string;
  description: string;
}) {
  return (
    <div
      className="bg-white px-6 py-10 text-center"
      data-testid="product-reviews-empty"
    >
      <div className="mx-auto mb-5 flex justify-center" aria-hidden="true">
        <ShiningStarIllustration />
      </div>
      <p className="font-semibold text-[#222] text-base sm:text-lg">
        {heading}
      </p>
      <p className="mt-2 text-[#222] text-sm">{description}</p>
    </div>
  );
}

function ShiningStarIllustration() {
  return (
    <svg
      width="72"
      height="72"
      viewBox="0 0 72 72"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-[#222]"
    >
      <g stroke="currentColor" strokeLinecap="round" strokeWidth="1.75">
        <path d="M36 8v6M36 58v6M8 36h6M58 36h6" />
        <path d="M17 17l4.5 4.5M50.5 50.5 55 55M55 17l-4.5 4.5M17 55l4.5-4.5" />
      </g>
      <path
        d="M36 22l3.2 9.8h10.3l-8.3 6 3.2 9.8L36 41.6l-8.4 6 3.2-9.8-8.3-6h10.3L36 22z"
        fill="#f0b429"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.75"
      />
    </svg>
  );
}
