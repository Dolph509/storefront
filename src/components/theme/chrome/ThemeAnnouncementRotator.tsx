"use client";

import { type ReactNode, useEffect, useState } from "react";

export function ThemeAnnouncementRotator({
  messages,
  intervalSeconds,
}: {
  messages: ReactNode[];
  intervalSeconds: number;
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (messages.length < 2) return;
    const timer = window.setInterval(
      () => setActiveIndex((index) => (index + 1) % messages.length),
      Math.max(1, intervalSeconds) * 1000,
    );
    return () => window.clearInterval(timer);
  }, [intervalSeconds, messages.length]);

  if (!messages.length) return null;
  return <>{messages[activeIndex % messages.length]}</>;
}
