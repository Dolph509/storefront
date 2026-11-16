import { Facebook, Instagram, Music2, Youtube } from "lucide-react";

export type SocialNetwork =
  | "facebook"
  | "instagram"
  | "pinterest"
  | "tiktok"
  | "youtube";

export function SocialPlatformIcon({
  network,
  size = 20,
}: {
  network: SocialNetwork;
  size?: number;
}) {
  const iconProps = { "aria-hidden": true as const, size, strokeWidth: 2 };
  switch (network) {
    case "facebook":
      return <Facebook {...iconProps} />;
    case "instagram":
      return <Instagram {...iconProps} />;
    case "tiktok":
      return <Music2 {...iconProps} />;
    case "youtube":
      return <Youtube {...iconProps} />;
    case "pinterest":
      return (
        <span
          aria-hidden="true"
          className="flex items-center justify-center rounded-full border-2 border-current font-serif font-bold leading-none"
          style={{ width: size, height: size, fontSize: size * 0.68 }}
        >
          P
        </span>
      );
  }
}
