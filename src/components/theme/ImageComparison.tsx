"use client";

import { useState } from "react";

export function ImageComparison({
  before,
  after,
  heading,
}: {
  before: string;
  after: string;
  heading: string;
}) {
  const [position, setPosition] = useState(50);
  return (
    <div
      data-theme-comparison
      className="relative aspect-[4/3] overflow-hidden rounded-md bg-marketplace-surface-warm"
    >
      <img
        data-theme-comparison-after
        src={after}
        alt={`${heading} after`}
        className="absolute inset-0 size-full object-cover"
      />
      <img
        data-theme-comparison-before
        src={before}
        alt={`${heading} before`}
        className="absolute inset-0 size-full object-cover"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
      />
      <span className="absolute left-3 top-3 rounded bg-black/65 px-2 py-1 text-xs text-white">
        Before
      </span>
      <span className="absolute right-3 top-3 rounded bg-black/65 px-2 py-1 text-xs text-white">
        After
      </span>
      <input
        type="range"
        min="0"
        max="100"
        value={position}
        aria-label={`${heading || "Image comparison"} slider`}
        onChange={(event) => setPosition(Number(event.target.value))}
        className="absolute inset-x-3 bottom-3 w-[calc(100%-1.5rem)] accent-white"
      />
    </div>
  );
}
