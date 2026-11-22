import { act, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import spreeHomeDefault from "@/lib/theme/spree-6-home-default.json";

const mocks = vi.hoisted(() => ({
  getMerchandisingPlacements: vi.fn(),
  getHomePersonalizationComposition: vi.fn(),
  resolveCurrency: vi.fn(),
  editorialStorefrontEnabled: vi.fn(),
  themeTemplateHomeEnabled: vi.fn(),
  getActiveTheme: vi.fn(),
  getResolvedTemplate: vi.fn(),
  themePageRender: vi.fn(),
  templateRender: vi.fn(),
  marketplaceHomeRender: vi.fn(),
}));

vi.mock("@/lib/data/merchandising", () => ({
  getMerchandisingPlacements: mocks.getMerchandisingPlacements,
}));
vi.mock("next/server", () => ({
  connection: vi.fn(),
}));
vi.mock("@/lib/data/markets", () => ({
  resolveCurrency: mocks.resolveCurrency,
}));
vi.mock("@/lib/data/storefront-personalization", () => ({
  getHomePersonalizationComposition: mocks.getHomePersonalizationComposition,
}));
vi.mock("@/lib/theme/flags", () => ({
  editorialStorefrontEnabled: mocks.editorialStorefrontEnabled,
  themeTemplateHomeEnabled: mocks.themeTemplateHomeEnabled,
}));
vi.mock("@/lib/theme/resolver", () => ({
  getActiveTheme: mocks.getActiveTheme,
  getResolvedTemplate: mocks.getResolvedTemplate,
  themeGroupHasContent: (document?: { order?: string[] }) =>
    Boolean(document?.order?.length),
}));
vi.mock("@/components/theme/ThemePageRenderer", () => ({
  ThemePageRenderer: (props: unknown) => {
    mocks.themePageRender(props);
    return <div data-testid="theme-homepage" />;
  },
}));
vi.mock("@/components/home/NativeMarketplaceHome", () => ({
  NativeMarketplaceHome: () => <div data-testid="native-homepage" />,
}));

import { HomePageContent } from "./HomePageContent";
import HomePage from "./page";

describe("storefront homepage theme template", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getMerchandisingPlacements.mockResolvedValue([]);
    mocks.getHomePersonalizationComposition.mockResolvedValue({});
    mocks.resolveCurrency.mockResolvedValue("USD");
    mocks.editorialStorefrontEnabled.mockReturnValue(false);
    mocks.themeTemplateHomeEnabled.mockReturnValue(true);
    mocks.getActiveTheme.mockResolvedValue({ id: "theme-1", settings: {} });
  });

  it("renders the published non-empty section template by default", async () => {
    mocks.getResolvedTemplate.mockResolvedValue({
      full_key: "home.default",
      data: {
        order: ["hero"],
        sections: { hero: { type: "hero", settings: {} } },
      },
    });

    render(
      await HomePageContent({
        country: "us",
        locale: "en",
        basePath: "/us/en",
      }),
    );

    expect(screen.getByTestId("theme-homepage")).toBeInTheDocument();
    expect(mocks.themePageRender).toHaveBeenCalledOnce();
    expect(screen.queryByTestId("native-homepage")).not.toBeInTheDocument();
  });

  it("uses the native homepage for a factory template and respects one edited heading", async () => {
    mocks.getResolvedTemplate.mockResolvedValue({ data: spreeHomeDefault });
    await renderLegacyHome();
    expect(screen.getByTestId("native-homepage")).toBeInTheDocument();
    const edited = structuredClone(spreeHomeDefault);
    edited.sections["home-hero"].settings.heading = "Autumn studio sale";
    mocks.getResolvedTemplate.mockResolvedValue({ data: edited });
    await renderLegacyHome();
    expect(mocks.themePageRender).toHaveBeenCalledOnce();
  });

  it("renders the new marketplace homepage when the saved template has no sections", async () => {
    mocks.getResolvedTemplate.mockResolvedValue({
      full_key: "home.default",
      data: { order: [], sections: {} },
    });

    await renderLegacyHome();

    expect(screen.getByTestId("native-homepage")).toBeInTheDocument();
    expect(mocks.themePageRender).not.toHaveBeenCalled();
  });

  it("renders the new marketplace homepage when theme data cannot be loaded", async () => {
    mocks.getActiveTheme.mockResolvedValue(null);
    mocks.getResolvedTemplate.mockResolvedValue(null);

    await renderLegacyHome();

    expect(screen.getByTestId("native-homepage")).toBeInTheDocument();
    expect(mocks.themePageRender).not.toHaveBeenCalled();
  });

  it("does not restore the old homepage when theme rendering is disabled", async () => {
    mocks.themeTemplateHomeEnabled.mockReturnValue(false);

    await renderLegacyHome();

    expect(screen.getByTestId("native-homepage")).toBeInTheDocument();
    expect(mocks.themePageRender).not.toHaveBeenCalled();
  });

  it("shows a neutral loading shell before homepage data resolves", async () => {
    mocks.resolveCurrency.mockReturnValue(new Promise(() => {}));
    render(
      await HomePage({
        params: Promise.resolve({ country: "us", locale: "en" }),
      }),
    );

    expect(screen.getByLabelText("Loading homepage")).toBeInTheDocument();
    expect(mocks.themePageRender).not.toHaveBeenCalled();
    expect(screen.queryByTestId("native-homepage")).not.toBeInTheDocument();
  });
});

async function renderLegacyHome() {
  const page = await HomePageContent({
    country: "us",
    locale: "en",
    basePath: "/us/en",
  });
  await act(async () => {
    render(page);
  });
}
