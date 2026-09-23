export function FeaturedShopsShowcaseSkeleton() {
  return (
    <section
      className="bg-marketplace-featured-shops py-10 md:py-12 lg:py-14"
      aria-hidden
    >
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:gap-10">
          <div className="shrink-0 space-y-6 lg:max-w-[16rem]">
            <div className="h-16 w-full max-w-[14rem] animate-pulse rounded-lg bg-[#eaeaea]" />
            <div className="h-11 w-36 animate-pulse rounded-full bg-[#eaeaea]" />
          </div>
          <div className="grid min-w-0 flex-1 grid-cols-3 gap-3 sm:gap-4">
            {[0, 1, 2].map((index) => (
              <div key={index} className="space-y-0">
                <div className="aspect-[4/5] animate-pulse rounded-xl bg-[#eaeaea]" />
                <div className="-mt-7 flex flex-col items-center">
                  <div className="size-14 animate-pulse rounded-full border-[3px] border-white bg-[#dedede]" />
                  <div className="mt-2 h-4 w-24 animate-pulse rounded bg-[#eaeaea]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
