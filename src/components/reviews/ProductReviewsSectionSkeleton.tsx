export function ProductReviewsSectionSkeleton({
  embedded = false,
}: {
  embedded?: boolean;
}) {
  return (
    <section
      id="reviews"
      aria-busy="true"
      className={
        embedded
          ? "border-t border-[#e1e3df] pt-10 pb-2"
          : "container mx-auto border-t border-[#e1e3df] px-4 py-10 sm:px-6 sm:py-12 lg:px-8"
      }
    >
      <div className="h-6 w-40 animate-pulse rounded bg-[#e8e8e8]" />
      <div className="mt-5 grid gap-8 border-b border-[#e1e3df] pb-6 sm:grid-cols-[11rem_1fr] sm:items-center">
        <div className="mx-auto flex w-full max-w-[11rem] flex-col items-center gap-2 sm:mx-0 sm:items-start">
          <div className="h-12 w-20 animate-pulse rounded bg-[#eceae6]" />
          <div className="h-5 w-28 animate-pulse rounded bg-[#eceae6]" />
          <div className="h-4 w-16 animate-pulse rounded bg-[#eceae6]" />
        </div>
        <div className="space-y-2.5">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="h-2 animate-pulse rounded-full bg-[#eceae6]"
            />
          ))}
        </div>
      </div>
      <div className="space-y-4">
        <div className="h-20 animate-pulse rounded bg-[#f5f5f5]" />
        <div className="h-20 animate-pulse rounded bg-[#f5f5f5]" />
      </div>
    </section>
  );
}
