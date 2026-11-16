export interface CmsSection {
  id: string;
  type: string;
  enabled: boolean;
  visibility?: { desktop?: boolean; tablet?: boolean; mobile?: boolean };
  settings: Record<string, unknown>;
}

export interface CmsPage {
  id: string;
  name: string;
  slug: string;
  page_type: string;
  status: string;
  seo: { title: string | null; description: string | null };
  version: number | null;
  sections: CmsSection[];
  published_at: string | null;
}

export interface CmsTheme {
  settings: {
    colors?: Record<string, string>;
    shape?: Record<string, string>;
    layout?: Record<string, string>;
  };
}
