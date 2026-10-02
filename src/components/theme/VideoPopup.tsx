"use client";

import { X } from "lucide-react";
import { useState } from "react";

export function VideoPopup({
  src,
  poster,
  title,
}: {
  src: string;
  poster?: string;
  title: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group relative block aspect-video w-full overflow-hidden rounded-md bg-black text-white"
        aria-label={`Play ${title || "video"}`}
      >
        {poster ? (
          <img
            src={poster}
            alt=""
            className="absolute inset-0 size-full object-cover opacity-85 transition group-hover:opacity-100"
          />
        ) : null}
        <span className="absolute inset-0 grid place-items-center">
          <span className="grid size-16 place-items-center rounded-full bg-black/70 text-2xl">
            ▶
          </span>
        </span>
      </button>
      {open ? (
        <div
          className="fixed inset-0 z-[100] grid place-items-center bg-black/80 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={title || "Video"}
          onClick={() => setOpen(false)}
        >
          <div
            className="relative w-full max-w-5xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute -top-11 right-0 grid size-9 place-items-center rounded-full bg-white text-black"
              aria-label="Close video"
            >
              <X className="size-5" />
            </button>
            <video
              src={src}
              controls
              autoPlay
              playsInline
              className="max-h-[80vh] w-full rounded-md bg-black"
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
