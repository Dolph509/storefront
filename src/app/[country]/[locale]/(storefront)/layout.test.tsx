import {
  Children,
  Fragment,
  type ReactElement,
  type ReactNode,
  Suspense,
} from "react";
import { describe, expect, it, vi } from "vitest";
import { REQUEST_PATHNAME_HEADER, REQUEST_SEARCH_HEADER } from "@/i18n/routing";

const mocks = vi.hoisted(() => ({
  headers: vi.fn(),
}));

vi.mock("next/server", () => ({ connection: vi.fn() }));
vi.mock("next/headers", () => ({ headers: mocks.headers }));
vi.mock("@/lib/data/categories", () => ({ getCategories: vi.fn() }));
vi.mock("@/lib/theme/flags", () => ({
  themeSectionGroupsEnabled: () => false,
}));
vi.mock("@/lib/theme/resolver", () => ({ getActiveTheme: vi.fn() }));
vi.mock("@/components/layout/Header", () => ({
  Header: () => null,
  HeaderMobileMenu: () => null,
}));
vi.mock("@/components/layout/Footer", () => ({
  Footer: () => null,
  FooterCategoryLinks: () => null,
}));

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import StorefrontLayout from "./layout";

interface LayoutElementProps {
  children?: ReactNode;
  mobileNavigation?: ReactElement<{ fallback: ReactNode }>;
  categoryLinks?: ReactElement<{ fallback: ReactNode }>;
  fallback?: ReactNode;
}

describe("StorefrontLayout", () => {
  it("keeps page chrome outside the category navigation Suspense boundaries", async () => {
    const content = <section>Storefront content</section>;
    mocks.headers.mockResolvedValue(
      new Headers({
        [REQUEST_PATHNAME_HEADER]: "/us/en/sellers/test-shop",
        [REQUEST_SEARCH_HEADER]: "",
      }),
    );
    const layout = (await StorefrontLayout({
      children: content,
      params: Promise.resolve({ country: "us", locale: "en" }),
    })) as ReactElement<LayoutElementProps>;

    expect(layout.type).toBe("div");

    const [header, categoryNavigation, main, footerGate] = Children.toArray(
      layout.props.children,
    ) as ReactElement<LayoutElementProps>[];
    const [footer, bottomNavigation] = Children.toArray(
      footerGate.props.children,
    ) as ReactElement<LayoutElementProps>[];

    expect(header.type).toBe(Header);
    expect(categoryNavigation.type).toBe(Suspense);
    expect(main.type).toBe("main");
    expect(main.props.children).toBe(content);
    expect(footer.type).toBe(Footer);
    expect(bottomNavigation.type).toBe(Suspense);

    const mobileNavigation = header.props.mobileNavigation;
    const categoryLinks = footer.props.categoryLinks;

    expect(mobileNavigation?.type).toBe(Suspense);
    expect(mobileNavigation?.props.fallback).not.toBeNull();
    expect(bottomNavigation.props.fallback).toBeNull();
    expect(categoryLinks?.type).toBe(Suspense);
    expect(categoryLinks?.props.fallback).not.toBeNull();
  });

  it("omits marketplace chrome in the shop editor preview", async () => {
    const content = <section>Shop preview</section>;
    mocks.headers.mockResolvedValue(
      new Headers({
        [REQUEST_PATHNAME_HEADER]: "/us/en/sellers/test-shop",
        [REQUEST_SEARCH_HEADER]: "?tab=home&shop_editor=1",
      }),
    );

    const layout = (await StorefrontLayout({
      children: content,
      params: Promise.resolve({ country: "us", locale: "en" }),
    })) as ReactElement<{ children?: ReactNode }>;

    expect(layout.type).toBe(Fragment);
    expect(layout.props.children).toBe(content);
  });
});
