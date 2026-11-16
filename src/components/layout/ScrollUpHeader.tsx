"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

export function ScrollUpHeader({
  children,
  sticky = true,
}: {
  children: ReactNode;
  sticky?: boolean;
}) {
  const [visible, setVisible] = useState(true);
  const previousY = useRef(0);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const header = wrapper?.querySelector<HTMLElement>("[data-theme-header]");
    if (!wrapper || !header) return;
    const syncSettings = () => {
      const shouldStick =
        header.dataset.stickyEnabled === "true" &&
        header.dataset.transparent !== "true";
      wrapper.classList.toggle("sticky", shouldStick);
      wrapper.classList.toggle("relative", !shouldStick);
      if (!shouldStick || header.dataset.stickyBehavior !== "scroll_up")
        setVisible(true);
    };
    syncSettings();
    const observer = new MutationObserver(syncSettings);
    observer.observe(header, {
      attributes: true,
      attributeFilter: [
        "data-sticky-enabled",
        "data-sticky-behavior",
        "data-transparent",
      ],
    });
    const onScroll = () => {
      const currentY = window.scrollY;
      const delta = currentY - previousY.current;
      const scrollUpMode =
        header.dataset.stickyBehavior === "scroll_up" &&
        header.dataset.stickyEnabled === "true" &&
        header.dataset.transparent !== "true";
      if (!scrollUpMode || currentY < 24 || delta < -6) setVisible(true);
      else if (delta > 6) setVisible(false);
      previousY.current = currentY;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div
      ref={wrapperRef}
      data-theme-scroll-up-header
      className={`${sticky ? "sticky" : "relative"} top-0 z-50 transition-transform duration-200 ${visible ? "translate-y-0" : "-translate-y-full"}`}
    >
      {children}
    </div>
  );
}
