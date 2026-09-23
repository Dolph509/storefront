"use client";

import { useState } from "react";

interface SellerAboutContentProps {
  html: string;
  readMoreLabel: string;
  readLessLabel: string;
  /** Plain-text length above which the excerpt + read more toggle appears. */
  collapseThreshold?: number;
  plainTextLength: number;
}

export function SellerAboutContent({
  html,
  readMoreLabel,
  readLessLabel,
  collapseThreshold = 480,
  plainTextLength,
}: SellerAboutContentProps) {
  const collapsible = plainTextLength > collapseThreshold;
  const [expanded, setExpanded] = useState(false);

  return (
    <div>
      <article
        className={`prose prose-sm max-w-3xl prose-p:text-[#222] prose-headings:font-semibold prose-headings:text-[#222] prose-a:text-[#222] prose-a:underline ${
          collapsible && !expanded ? "max-h-[14rem] overflow-hidden" : ""
        }`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
      {collapsible ? (
        <button
          type="button"
          className="mt-3 text-sm font-medium text-[#222] underline decoration-[#222]/40 underline-offset-2 hover:decoration-[#222]"
          onClick={() => setExpanded((open) => !open)}
          aria-expanded={expanded}
        >
          {expanded ? readLessLabel : readMoreLabel}
        </button>
      ) : null}
    </div>
  );
}
