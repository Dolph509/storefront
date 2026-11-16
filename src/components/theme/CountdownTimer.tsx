"use client";

import { useEffect, useState } from "react";

function remainingMilliseconds(target: string): number {
  const timestamp = Date.parse(target);
  return Number.isFinite(timestamp) ? Math.max(0, timestamp - Date.now()) : 0;
}

export function CountdownTimer({
  target,
  expiredText = "Offer ended",
}: {
  target: string;
  expiredText?: string;
}) {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    setRemaining(remainingMilliseconds(target));
    const interval = window.setInterval(
      () => setRemaining(remainingMilliseconds(target)),
      1000,
    );
    return () => window.clearInterval(interval);
  }, [target]);

  if (remaining === null) {
    return (
      <div
        role="timer"
        aria-label="Countdown"
        aria-busy="true"
        className="flex flex-wrap justify-center gap-3 font-mono text-xl tabular-nums"
      >
        {[
          ["00", "Days"],
          ["00", "Hours"],
          ["00", "Minutes"],
          ["00", "Seconds"],
        ].map(([value, label]) => (
          <span
            key={label}
            className="min-w-14 rounded-md border border-marketplace-border px-3 py-2"
          >
            <strong>{value}</strong>
            <span className="mt-1 block text-[10px] font-sans uppercase tracking-wide">
              {label}
            </span>
          </span>
        ))}
      </div>
    );
  }
  if (remaining <= 0) return <span>{expiredText}</span>;
  const totalSeconds = Math.floor(remaining / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return (
    <div
      role="timer"
      aria-label={`${days} days ${hours} hours ${minutes} minutes ${seconds} seconds`}
      className="flex flex-wrap justify-center gap-3 font-mono text-xl tabular-nums"
    >
      {[
        [days, "Days"],
        [hours, "Hours"],
        [minutes, "Minutes"],
        [seconds, "Seconds"],
      ].map(([value, label]) => (
        <span
          key={label}
          className="min-w-14 rounded-md border border-marketplace-border px-3 py-2"
        >
          <strong>{String(value).padStart(2, "0")}</strong>
          <span className="mt-1 block text-[10px] font-sans uppercase tracking-wide">
            {label}
          </span>
        </span>
      ))}
    </div>
  );
}
