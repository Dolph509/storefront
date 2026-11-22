import type { CollaborationCredit } from "@spree/sdk";

export type MadeTogetherMakerRole = "lead_seller" | CollaborationCredit["role"];

export type MadeTogetherMaker = {
  key: string;
  name: string;
  slug: string | null;
  href: string | null;
  logoUrl: string | null;
  craftContribution: string | null;
  averageRating: number | null;
  reviewsCount: number;
  starSeller: boolean;
  isSellerOfRecord?: boolean;
  role?: MadeTogetherMakerRole;
  tagline?: string | null;
  shipsFrom?: string | null;
  followersCount?: number;
};

export type MadeTogetherPresentation = {
  makers: MadeTogetherMaker[];
  /** Average of maker shop ratings when available. */
  aggregateRating: number | null;
  /** Stars shown in the compact buy box (makers, else product reviews). */
  compactRating: number | null;
};
