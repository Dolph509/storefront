"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function SellerShopAnnouncementDialog({
  title,
  content,
  canExpand,
  readMoreLabel,
  closeLabel,
}: {
  title: string;
  content: string;
  canExpand: boolean;
  readMoreLabel: string;
  closeLabel: string;
}) {
  if (!canExpand) return null;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="mt-2 inline-flex min-h-8 items-center rounded-sm text-sm font-semibold text-marketplace-foreground underline underline-offset-4 hover:text-marketplace-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marketplace-foreground"
        >
          {readMoreLabel}
        </button>
      </DialogTrigger>
      <DialogContent className="flex max-h-[min(85dvh,44rem)] w-[calc(100%-2rem)] max-w-3xl flex-col gap-0 overflow-hidden rounded-lg border-[#e3ddd8] bg-white p-0 shadow-xl">
        <DialogHeader className="shrink-0 border-b border-[#e3ddd8] bg-[#faf9f7] px-5 py-4 pr-12 text-left sm:px-6 sm:pr-14">
          <DialogTitle className="text-base font-semibold text-marketplace-foreground">
            {title}
          </DialogTitle>
          <DialogDescription className="sr-only">{title}</DialogDescription>
        </DialogHeader>
        <div
          className="prose prose-sm min-h-0 max-w-none flex-1 overflow-y-auto px-5 py-5 text-[#514940] sm:px-6 sm:py-6"
          dangerouslySetInnerHTML={{ __html: content }}
        />
        <div className="flex shrink-0 justify-center border-t border-[#e3ddd8] bg-white p-3">
          <DialogClose asChild>
            <Button variant="ghost" size="sm">
              {closeLabel}
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
