"use client";

import { useEffect, useState } from "react";
import { getUnreadMessageCount } from "@/lib/data/messages";

export function MessagesNavBadge() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    void getUnreadMessageCount()
      .then((value) => {
        if (!cancelled) setCount(value);
      })
      .catch(() => {
        if (!cancelled) setCount(0);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (count <= 0) return null;

  return (
    <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-marketplace-sale px-1 text-[9px] font-semibold leading-none text-white">
      {count > 99 ? "99+" : count}
    </span>
  );
}
