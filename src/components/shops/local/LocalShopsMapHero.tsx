import { MapPin } from "lucide-react";

interface LocalShopsMapHeroProps {
  title: string;
  description: string;
  locationLabel?: string | null;
}

export function LocalShopsMapHero({
  title,
  description,
  locationLabel,
}: LocalShopsMapHeroProps) {
  return (
    <header className="overflow-hidden rounded-[1.25rem] border border-[#e4ddd2] bg-[#f4efe6]">
      <div className="relative min-h-[9.5rem] sm:min-h-[11rem]">
        <svg
          aria-hidden
          className="absolute inset-0 size-full"
          viewBox="0 0 1200 280"
          preserveAspectRatio="xMidYMid slice"
        >
          <rect width="1200" height="280" fill="#dce9f2" />
          <path
            d="M0 180 C120 120 220 210 340 150 C460 90 520 200 680 140 C820 90 920 190 1040 130 C1120 95 1180 150 1200 120 L1200 280 L0 280 Z"
            fill="#e8dcc4"
          />
          <path
            d="M0 210 C160 170 260 240 400 190 C560 130 640 230 800 180 C940 140 1040 220 1200 170 L1200 280 L0 280 Z"
            fill="#ddd0b6"
          />
          <circle cx="210" cy="118" r="8" fill="#452c4f" opacity="0.55" />
          <circle cx="520" cy="96" r="7" fill="#452c4f" opacity="0.45" />
          <circle cx="780" cy="132" r="8" fill="#452c4f" opacity="0.5" />
          <circle cx="980" cy="104" r="6" fill="#452c4f" opacity="0.4" />
        </svg>

        <div className="relative z-[1] flex h-full min-h-[9.5rem] flex-col justify-end gap-2 px-5 py-5 sm:min-h-[11rem] sm:px-8 sm:py-7">
          {locationLabel ? (
            <p className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white/85 px-3 py-1 text-xs font-medium text-marketplace-foreground shadow-sm backdrop-blur-sm">
              <MapPin aria-hidden className="size-3.5 text-marketplace-brand" />
              {locationLabel}
            </p>
          ) : null}
          <h1 className="max-w-xl font-display text-[clamp(1.85rem,1.5rem+1.5vw,2.75rem)] font-normal leading-[1.08] tracking-[-0.03em] text-marketplace-foreground">
            {title}
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-marketplace-muted-foreground sm:text-[0.9375rem]">
            {description}
          </p>
        </div>
      </div>
    </header>
  );
}
