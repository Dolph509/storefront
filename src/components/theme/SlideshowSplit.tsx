"use client";

import Link from "next/link";
import { useState } from "react";

export function SlideshowSplit({
  images,
  heading,
  eyebrow,
  body,
  href,
  buttonText,
  imagePosition = "right",
}: {
  images: string[];
  heading: string;
  eyebrow?: string;
  body?: string;
  href?: string;
  buttonText?: string;
  imagePosition?: "left" | "right";
}) {
  const [active, setActive] = useState(0);
  const image = images[active];
  if (!image) return null;
  return (
    <div
      className={`grid items-center gap-8 md:grid-cols-2 ${imagePosition === "left" ? "" : ""}`}
    >
      <div className={imagePosition === "left" ? "md:order-2" : ""}>
        {eyebrow ? (
          <p className="text-xs uppercase tracking-widest text-marketplace-brand">
            {eyebrow}
          </p>
        ) : null}
        <h2
          data-theme-section-heading
          className="mt-3 font-display text-3xl font-semibold text-marketplace-brand"
        >
          {heading}
        </h2>
        <p
          data-theme-section-body
          hidden={!body}
          className="mt-4 whitespace-pre-line text-marketplace-muted-foreground"
        >
          {body}
        </p>
        {href && buttonText ? (
          <Link
            href={href}
            className="mt-6 inline-block border-b border-marketplace-brand pb-1 text-marketplace-brand"
          >
            {buttonText}
          </Link>
        ) : null}
        {images.length > 1 ? (
          <div className="mt-5 flex gap-2">
            {images.map((src, index) => (
              <button
                key={`${src}-${index}`}
                type="button"
                aria-label={`Show slide ${index + 1}`}
                aria-pressed={active === index}
                onClick={() => setActive(index)}
                className={`size-2.5 rounded-full ${active === index ? "bg-marketplace-brand" : "bg-marketplace-border"}`}
              />
            ))}
          </div>
        ) : null}
      </div>
      <img
        src={image}
        alt={heading}
        className={`max-h-[38rem] w-full rounded-md object-cover ${imagePosition === "left" ? "md:order-1" : ""}`}
      />
    </div>
  );
}
