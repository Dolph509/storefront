import { Star, UserRound } from "lucide-react";

const stories = [
  "Absolutely beautiful craftsmanship! You can feel the love and care that goes into every piece.",
  "The perfect gift! Exactly as described and even more beautiful in person.",
  "Such a meaningful piece. It is now one of my favorite things in my home.",
];

export function CustomerLoveSection() {
  return (
    <section className="bg-marketplace-background py-4 md:py-5">
      <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-0">
        <div className="mb-3 flex items-end justify-between">
          <div>
            <h2 className="font-display text-2xl font-semibold leading-none text-marketplace-brand">
              Customer Love
            </h2>
            <p className="mt-1 text-xs text-marketplace-muted-foreground">
              Real stories from happy customers.
            </p>
          </div>
          <span className="text-xs font-semibold text-marketplace-brand">
            View All Reviews →
          </span>
        </div>
        <div className="grid gap-2 md:grid-cols-3">
          {stories.map((story, index) => (
            <article
              key={story}
              className="flex gap-3 rounded-md border border-marketplace-border-subtle bg-white p-3"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-marketplace-canvas text-marketplace-brand">
                <UserRound className="size-4" aria-hidden />
              </span>
              <div>
                <div className="flex gap-0.5 text-marketplace-brand">
                  {[...Array(5)].map((_, starIndex) => (
                    <Star key={starIndex} className="size-2.5 fill-current" />
                  ))}
                </div>
                <p className="mt-1 text-xs leading-snug text-marketplace-muted-foreground">
                  “{story}”
                </p>
                <p className="mt-1 text-[10px] font-semibold text-marketplace-foreground">
                  Verified buyer {index + 1}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
