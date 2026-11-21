export function HomePageLoadingFallback() {
  return (
    <div
      role="status"
      className="min-h-svh bg-marketplace-background"
      aria-busy="true"
      aria-label="Loading homepage"
    >
      <div
        aria-hidden="true"
        className="mx-auto max-w-[var(--marketplace-container,1440px)] px-4 py-8 sm:px-6 lg:px-8"
      >
        <div className="grid gap-8 border-b border-marketplace-border-subtle pb-10 lg:grid-cols-12 lg:items-center">
          <div className="space-y-5 lg:col-span-5">
            <div className="h-3 w-36 rounded-xs bg-marketplace-accent" />
            <div className="space-y-2.5">
              <div className="h-10 w-11/12 rounded-xs bg-marketplace-accent" />
              <div className="h-10 w-3/4 rounded-xs bg-marketplace-accent" />
            </div>
            <div className="h-4 w-5/6 rounded-xs bg-marketplace-surface-subtle" />
            <div className="flex gap-3 pt-2">
              <div className="h-11 w-40 rounded-xs bg-marketplace-accent" />
              <div className="h-11 w-36 rounded-xs bg-marketplace-surface-subtle" />
            </div>
          </div>
          <div className="grid grid-cols-12 gap-4 max-lg:order-first lg:col-span-7">
            <div className="col-span-8 aspect-[4/5] rounded-sm bg-marketplace-surface-subtle" />
            <div className="col-span-4 mt-12 aspect-[3/4] rounded-sm bg-marketplace-accent" />
          </div>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <div className="aspect-[4/5] rounded-sm bg-marketplace-surface-subtle" />
              <div className="h-3.5 w-2/3 rounded-xs bg-marketplace-surface-subtle" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
