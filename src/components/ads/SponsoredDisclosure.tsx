export function SponsoredDisclosure({ label }: { label: string }) {
  return (
    <span
      className="inline-flex items-center rounded-sm bg-marketplace-surface-subtle px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-marketplace-muted-foreground ring-1 ring-marketplace-border-subtle"
      data-sponsored-disclosure
    >
      {label}
    </span>
  );
}
