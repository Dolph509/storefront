import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { getEditorialCategories } from "@/lib/marketplace-stock-images";

export function HomeCollectionsExplorer({ basePath }: { basePath: string }) {
  const collections = getEditorialCategories(basePath).slice(0, 4);

  return (
    <section className="bg-marketplace-background py-5 md:py-7">
      <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-0">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-marketplace-brand">
              Discover handmade
            </p>
            <h2 className="mt-1 font-display text-3xl font-semibold text-marketplace-foreground">
              Shop Collections
            </h2>
          </div>
          <Link
            href={`${basePath}/products`}
            className="text-sm font-semibold text-marketplace-brand hover:underline"
          >
            View all <ArrowRight className="inline size-4" aria-hidden />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {collections.map((collection) => (
            <Link
              key={collection.id}
              href={collection.href}
              className="group overflow-hidden rounded-lg border border-marketplace-border-subtle bg-white"
            >
              {/* biome-ignore lint/performance/noImgElement: fixed local editorial asset */}
              <img
                src={collection.imageUrl}
                alt=""
                className="aspect-[1.4] w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <span className="flex items-center justify-between px-3 py-2 font-display text-lg font-semibold text-marketplace-foreground">
                {collection.name}
                <ArrowRight className="size-4" aria-hidden />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
