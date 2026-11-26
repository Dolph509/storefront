"use client";

import type { Message, MessageThread } from "@spree/sdk";
import { ChevronLeft, Clock, ImagePlus, Send, Shield, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { BuyerChatProductContextCard } from "@/components/messages/BuyerChatProductContextCard";
import { MessageProductContextCard } from "@/components/messages/MessageProductContextCard";
import { MessagingUnavailableNotice } from "@/components/messages/MessagingUnavailableNotice";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import type { BuyerSellerChatSession } from "@/contexts/BuyerSellerChatContext";
import {
  askAboutProduct,
  contactSeller,
  findMessageThreadForProduct,
  findMessageThreadForSeller,
  getMessageThread,
  getMessageThreadMessages,
  markMessageThreadRead,
  sendMessageThreadReply,
  uploadMessageImage,
} from "@/lib/data/messages";
import { cn } from "@/lib/utils";
import { formatDateTime } from "@/lib/utils/format";

type PendingImage = {
  key: string;
  signedId: string;
  previewUrl: string;
  filename: string;
};

interface BuyerSellerChatDockProps {
  basePath: string;
  session: BuyerSellerChatSession;
  onClose: () => void;
}

export function BuyerSellerChatDock({
  basePath,
  session,
  onClose,
}: BuyerSellerChatDockProps) {
  const t = useTranslations("messages");
  const locale = useLocale();
  const pathname = usePathname();
  const normalizedPath = pathname.replace(/^\/storefront-embed(?=\/|$)/, "");
  const isAccountArea = /\/account(\/|$)/.test(normalizedPath);
  const isOnInbox =
    normalizedPath.endsWith("/account/messages") ||
    /\/account\/messages\/[^/]+$/.test(normalizedPath);
  const fileInputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [thread, setThread] = useState<MessageThread | null>(
    () => session.threadSnapshot ?? null,
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(() =>
    Boolean(session.threadId && !session.threadSnapshot),
  );
  const [messagesLoading, setMessagesLoading] = useState(() =>
    Boolean(session.threadId),
  );
  const [body, setBody] = useState("");
  const [images, setImages] = useState<PendingImage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);

  const chronological = useMemo(() => [...messages].reverse(), [messages]);
  const productContextFromMessages = useMemo(() => {
    for (let index = chronological.length - 1; index >= 0; index -= 1) {
      const message = chronological[index];
      if (message.product_name) {
        return {
          name: message.product_name,
          slug: message.product_slug ?? undefined,
          thumbnailUrl: message.product_thumbnail_url,
        };
      }
    }
    return null;
  }, [chronological]);
  const productCardName =
    session.productName ?? productContextFromMessages?.name;
  const productCardSlug =
    session.productSlug ?? productContextFromMessages?.slug;
  const productCardThumbnail =
    session.productThumbnailUrl ?? productContextFromMessages?.thumbnailUrl;
  const trimmed = body.trim();
  const writable = thread?.writable ?? true;
  const canSend =
    writable &&
    !pending &&
    !uploading &&
    (thread ? trimmed.length > 0 || images.length > 0 : trimmed.length > 0);

  const sessionKey =
    session.threadId ??
    [
      session.sellerSlug,
      session.productId ?? "",
      session.productName ?? "",
    ].join("|");

  useEffect(() => {
    let cancelled = false;

    async function resolveConversation() {
      setError(null);
      const snapshot = session.threadSnapshot;

      if (snapshot) {
        setThread(snapshot);
        setLoading(false);
      } else if (session.threadId) {
        setLoading(true);
      } else {
        setLoading(false);
        setThread(null);
        setMessages([]);
        setMessagesLoading(false);
      }

      try {
        let activeThread: MessageThread | null = snapshot ?? null;
        if (session.threadId) {
          const refreshed = await getMessageThread(session.threadId);
          if (refreshed) activeThread = refreshed;
        } else if (session.productId && session.productName) {
          activeThread = await findMessageThreadForProduct(
            session.sellerSlug,
            session.productName,
          );
        }
        if (!activeThread && session.sellerSlug && !session.threadId) {
          activeThread = await findMessageThreadForSeller(session.sellerSlug);
        }
        if (cancelled) return;

        if (activeThread) {
          setThread(activeThread);
          setMessagesLoading(true);
          const page = await getMessageThreadMessages(activeThread.id, {
            limit: 50,
          });
          if (cancelled) return;
          setMessages(page.data);
          if (activeThread.unread) {
            try {
              await markMessageThreadRead(activeThread.id);
            } catch {
              /* read receipts are best-effort */
            }
          }
        } else if (!session.threadId) {
          setMessages([]);
        }
      } catch {
        if (!cancelled) setError(t("openFailed"));
      } finally {
        if (!cancelled) {
          setLoading(false);
          setMessagesLoading(false);
        }
      }
    }

    void resolveConversation();
    return () => {
      cancelled = true;
    };
  }, [sessionKey]);

  useEffect(() => {
    const node = scrollRef.current;
    if (!node) return;
    node.scrollTop = node.scrollHeight;
  }, [chronological.length, loading]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    if (isAccountArea) return;
    const stickyBar = document.querySelector<HTMLElement>(
      "[data-product-sticky-purchase='true']",
    );
    if (!stickyBar) return;
    const previousVisibility = stickyBar.style.visibility;
    stickyBar.style.visibility = "hidden";
    return () => {
      stickyBar.style.visibility = previousVisibility;
    };
  }, [isAccountArea]);

  async function handleAddImages(fileList: FileList | null) {
    if (!fileList?.length) return;
    setError(null);
    setUploading(true);
    try {
      const next: PendingImage[] = [];
      for (const file of Array.from(fileList)) {
        if (!file.type.startsWith("image/")) {
          setError(t("imagesType"));
          continue;
        }
        const formData = new FormData();
        formData.set("file", file);
        const signedId = await uploadMessageImage(formData);
        next.push({
          key: `${file.name}-${file.size}-${file.lastModified}`,
          signedId,
          previewUrl: URL.createObjectURL(file),
          filename: file.name,
        });
      }
      if (next.length) setImages((current) => [...current, ...next]);
    } catch {
      setError(t("imagesFailed"));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function handleSend() {
    if (!canSend && !trimmed && images.length === 0) return;
    setError(null);
    startTransition(async () => {
      try {
        let activeThread = thread;
        if (!activeThread) {
          activeThread = session.productId
            ? await askAboutProduct({
                product_id: session.productId,
                body: trimmed || " ",
              })
            : await contactSeller({
                seller_id: session.sellerSlug,
                body: trimmed || " ",
              });
          setThread(activeThread);
        } else {
          await sendMessageThreadReply(
            activeThread.id,
            trimmed,
            images.map((image) => image.signedId),
          );
        }
        for (const image of images) URL.revokeObjectURL(image.previewUrl);
        setBody("");
        setImages([]);
        const page = await getMessageThreadMessages(activeThread.id, {
          limit: 50,
        });
        setMessages(page.data);
        await markMessageThreadRead(activeThread.id);
      } catch {
        setError(t("sendFailed"));
      }
    });
  }

  const title = t("chatDockTitle", { name: session.sellerName });

  return (
    <>
      <button
        type="button"
        aria-label={t("closeChat")}
        className="fixed inset-0 z-[149] bg-black/45 md:hidden"
        onClick={onClose}
      />
      <div
        className={cn(
          "fixed z-[150] flex w-full flex-col overflow-hidden bg-white shadow-[0_12px_40px_rgba(0,0,0,0.14)]",
          "max-md:inset-x-0 max-md:bottom-0 max-md:h-[min(92dvh,44rem)] max-md:max-h-[min(92dvh,44rem)] max-md:rounded-t-2xl max-md:border max-md:border-marketplace-border-subtle",
          "md:inset-x-auto md:right-5 md:bottom-5 md:h-[min(92vh,44rem)] md:max-h-[min(92vh,44rem)] md:w-[26rem] md:rounded-2xl md:border md:border-marketplace-border-subtle",
        )}
        data-buyer-seller-chat-dock
        role="dialog"
        aria-modal="true"
        aria-labelledby="buyer-seller-chat-title"
      >
        <div
          aria-hidden
          className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-marketplace-border md:hidden"
        />
        <header
          className={cn(
            "flex shrink-0 items-start gap-3 border-b border-marketplace-border-subtle px-4 py-3",
            isAccountArea &&
              "max-md:pt-[calc(0.75rem+env(safe-area-inset-top,0px))]",
          )}
        >
          {isAccountArea ? (
            <button
              type="button"
              onClick={onClose}
              className="-ml-1 mt-0.5 shrink-0 rounded-md p-2 text-marketplace-foreground hover:bg-marketplace-accent md:hidden"
              aria-label={t("backToInbox")}
            >
              <ChevronLeft className="size-5" aria-hidden />
            </button>
          ) : null}
          <SellerAvatar
            name={session.sellerName}
            logoUrl={session.sellerLogoUrl}
          />
          <div className="min-w-0 flex-1">
            <h2
              id="buyer-seller-chat-title"
              className="truncate text-sm font-semibold text-marketplace-foreground"
            >
              {title}
            </h2>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-marketplace-muted-foreground">
              <Clock className="size-3.5 shrink-0" aria-hidden />
              {t("typicalResponseTime")}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-marketplace-muted-foreground transition-colors hover:bg-marketplace-accent hover:text-marketplace-foreground"
            aria-label={t("closeChat")}
          >
            <X className="size-4" aria-hidden />
          </button>
        </header>

        {productCardName ? (
          <div className="shrink-0 border-b border-marketplace-border-subtle px-4 py-3">
            <BuyerChatProductContextCard
              name={productCardName}
              slug={productCardSlug}
              thumbnailUrl={productCardThumbnail}
              basePath={basePath}
            />
          </div>
        ) : null}

        <div
          ref={scrollRef}
          className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-4"
        >
          {loading ? (
            <p className="m-auto text-sm text-marketplace-muted-foreground">
              {t("loadingChat")}
            </p>
          ) : messagesLoading && chronological.length === 0 ? (
            <p className="m-auto text-sm text-marketplace-muted-foreground">
              {t("loadingChat")}
            </p>
          ) : chronological.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 px-2 py-8 text-center">
              <SellerAvatar
                name={session.sellerName}
                logoUrl={session.sellerLogoUrl}
                size="lg"
              />
              <div className="space-y-2">
                <p className="text-base font-semibold text-marketplace-foreground">
                  {t("chatEmptyTitle")}
                </p>
                <p className="mx-auto max-w-[18rem] text-sm leading-relaxed text-marketplace-muted-foreground">
                  {t("chatEmptyBody", { name: session.sellerName })}
                </p>
              </div>
              <p className="flex items-center gap-1.5 text-xs text-marketplace-muted-foreground">
                <Clock className="size-3.5 shrink-0" aria-hidden />
                {t("typicalResponseTime")}
              </p>
            </div>
          ) : (
            <ul className="flex flex-col gap-3">
              {chronological.map((message) => (
                <ChatBubble
                  key={message.id}
                  message={message}
                  basePath={basePath}
                  locale={locale}
                />
              ))}
            </ul>
          )}
        </div>

        <div
          className={cn(
            "shrink-0 border-t border-marketplace-border-subtle px-4 pt-3",
            "pb-[max(0.75rem,env(safe-area-inset-bottom,0px))] md:pb-3",
          )}
        >
          <p
            className={cn(
              "mb-2 flex items-start gap-1.5 text-[10px] leading-snug text-marketplace-muted-foreground",
              isAccountArea && "max-md:sr-only",
            )}
          >
            <Shield className="mt-0.5 size-3 shrink-0" aria-hidden />
            <span>
              {t("chatSecurityNotice")}{" "}
              <Link
                href={`${basePath}/pages/privacy-policy`}
                className="underline underline-offset-2"
              >
                {t("chatSecurityLearnMore")}
              </Link>
            </span>
          </p>
          {error ? (
            <p role="alert" className="mb-2 text-xs text-marketplace-danger">
              {error}
            </p>
          ) : null}
          {!writable ? (
            <MessagingUnavailableNotice className="text-xs" />
          ) : (
            <div className="space-y-2">
              {images.length > 0 ? (
                <ul className="flex flex-wrap gap-2">
                  {images.map((image) => (
                    <li key={image.key} className="relative">
                      <img
                        src={image.previewUrl}
                        alt={image.filename}
                        className="size-12 rounded-md border object-cover"
                      />
                    </li>
                  ))}
                </ul>
              ) : null}
              <InputGroup className="h-12 rounded-full border-marketplace-border/80 bg-white px-1 shadow-sm has-[[data-slot=input-group-control]:focus]:border-marketplace-brand/40 has-[[data-slot=input-group-control]:focus]:ring-2 has-[[data-slot=input-group-control]:focus]:ring-marketplace-brand/15">
                <input
                  ref={fileInputRef}
                  id={fileInputId}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  multiple
                  className="sr-only"
                  onChange={(event) => void handleAddImages(event.target.files)}
                />
                <InputGroupAddon align="inline-start" className="pl-1.5">
                  <InputGroupButton
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="size-9 rounded-full text-marketplace-muted-foreground hover:bg-marketplace-accent hover:text-marketplace-foreground"
                    disabled={uploading || pending}
                    onClick={() => fileInputRef.current?.click()}
                    aria-label={t("addPhotos")}
                  >
                    <ImagePlus className="size-5 stroke-[1.75]" aria-hidden />
                  </InputGroupButton>
                </InputGroupAddon>
                <InputGroupInput
                  value={body}
                  onChange={(event) => setBody(event.target.value)}
                  placeholder={t("chatInputPlaceholder")}
                  className="h-11 min-w-0 px-0 text-[15px] placeholder:text-marketplace-muted-foreground/80"
                  maxLength={10_000}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      if (canSend) handleSend();
                    }
                  }}
                />
                <InputGroupAddon align="inline-end" className="pr-1.5">
                  <InputGroupButton
                    type="button"
                    size="icon-sm"
                    variant={canSend ? "default" : "secondary"}
                    className={cn(
                      "size-10 shrink-0 rounded-full border-0 shadow-none transition-colors",
                      canSend
                        ? "bg-[#9a8fae] text-white hover:bg-[#8a7f9e]"
                        : "bg-marketplace-surface-warm text-marketplace-muted-foreground",
                    )}
                    disabled={!canSend}
                    onClick={handleSend}
                    aria-label={t("send")}
                  >
                    <Send className="size-[18px] stroke-[2]" aria-hidden />
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
            </div>
          )}
          {!isOnInbox ? (
            <Link
              href={`${basePath}/account/messages${thread ? `/${thread.id}` : ""}`}
              className="mt-2 block text-center text-[11px] text-marketplace-muted-foreground underline-offset-2 hover:underline"
            >
              {t("openFullInbox")}
            </Link>
          ) : null}
        </div>
      </div>
    </>
  );
}

function SellerAvatar({
  name,
  logoUrl,
  size = "md",
}: {
  name: string;
  logoUrl?: string | null;
  size?: "md" | "lg";
}) {
  const dimension = size === "lg" ? 80 : 44;
  const initials = name
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  if (logoUrl) {
    return (
      <Image
        src={logoUrl}
        alt=""
        width={dimension}
        height={dimension}
        unoptimized
        className={cn(
          "shrink-0 rounded-xl border border-marketplace-border-subtle object-cover",
          size === "lg" ? "size-20" : "size-11",
        )}
      />
    );
  }

  return (
    <span
      aria-hidden
      className={cn(
        "grid shrink-0 place-items-center rounded-xl bg-marketplace-surface-warm text-xs font-semibold text-marketplace-brand",
        size === "lg" ? "size-20 text-base" : "size-11",
      )}
    >
      {initials}
    </span>
  );
}

function ChatBubble({
  message,
  basePath,
  locale,
}: {
  message: Message;
  basePath: string;
  locale: string;
}) {
  const t = useTranslations("messages");
  const isBuyer = message.sender_type === "customer";

  return (
    <li
      className={cn(
        "w-fit max-w-[min(88%,20rem)] rounded-2xl px-3.5 py-2.5 text-[15px] leading-snug md:max-w-[88%] md:px-3 md:py-2 md:text-sm",
        isBuyer
          ? "self-end bg-marketplace-brand text-marketplace-brand-foreground"
          : "self-start border border-marketplace-border-subtle bg-marketplace-surface text-marketplace-foreground",
      )}
    >
      <p
        className={cn(
          "mb-1 text-[10px] font-medium",
          isBuyer
            ? "text-marketplace-brand-foreground/70"
            : "text-marketplace-muted-foreground",
        )}
      >
        {isBuyer
          ? t("sender_customer")
          : t(`sender_${message.sender_type}`, {
              defaultValue: message.sender_type,
            })}
        {" · "}
        <time dateTime={message.created_at}>
          {formatDateTime(message.created_at, locale)}
        </time>
      </p>
      <MessageProductContextCard message={message} basePath={basePath} />
      {message.body ? (
        <p className="whitespace-pre-wrap break-words">{message.body}</p>
      ) : null}
    </li>
  );
}
