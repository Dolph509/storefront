"use client";

import type { Cart, LineItem, PersonalizationSelectionInput } from "@spree/sdk";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { toast } from "sonner";
import {
  addToCart as addToCartAction,
  getCart as getCartAction,
  removeCartItem as removeCartItemAction,
  updateCartItem as updateCartItemAction,
} from "@/lib/data/cart";
import type { CartDiscoveryInput } from "@/lib/discovery-context";
import type { Surface } from "@/lib/spree/surface";

type AddItemResult =
  | { success: true; cart?: Cart | null }
  | {
      success: false;
      error?: string;
      code?: string;
      details?: Record<string, unknown>;
    };

interface CartContextType {
  cart: Cart | null;
  loading: boolean;
  updating: boolean;
  itemCount: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (
    variantId: string,
    quantity?: number,
    personalization?: PersonalizationSelectionInput[],
    discovery?: CartDiscoveryInput,
  ) => Promise<AddItemResult>;
  updateItem: (lineItemId: string, quantity: number) => Promise<void>;
  removeItem: (lineItemId: string) => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({
  children,
  surface = "dtc",
}: {
  children: ReactNode;
  /** Which surface's cart this provider manages. Defaults to the DTC cart. */
  surface?: Surface;
}) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("cart");

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const refreshCart = useCallback(async () => {
    try {
      const cartData = await getCartAction(undefined, surface);
      setCart(cartData);
    } catch {
      setCart(null);
    } finally {
      setLoading(false);
    }
  }, [surface]);

  const mutateCart = useCallback(
    async (
      action: () => Promise<{
        success: boolean;
        cart?: Cart | null;
        error?: string;
      }>,
      fallbackMessage: string,
      onSuccess?: () => void,
    ) => {
      setUpdating(true);
      try {
        const result = await action();
        if (result.success) {
          setCart(result.cart ?? null);
          onSuccess?.();
          router.refresh();
        } else {
          toast.error(result.error || fallbackMessage);
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : fallbackMessage);
      } finally {
        setUpdating(false);
      }
    },
    [router],
  );

  const addItem = useCallback(
    async (
      variantId: string,
      quantity = 1,
      personalization?: PersonalizationSelectionInput[],
      discovery?: CartDiscoveryInput,
    ): Promise<AddItemResult> => {
      setUpdating(true);
      try {
        const result = await addToCartAction(
          variantId,
          quantity,
          surface,
          personalization,
          discovery,
        );
        if (result.success) {
          setCart(result.cart ?? null);
          setIsOpen(true);
          router.refresh();
          return { success: true, cart: result.cart };
        }
        // Personalized failures are mapped by the PDP; toast only generic ones.
        if (!personalization?.length) {
          toast.error(result.error || t("failedToAddItem"));
        }
        return {
          success: false,
          error: result.error,
          code: "code" in result ? result.code : undefined,
          details: "details" in result ? result.details : undefined,
        };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : t("failedToAddItem");
        toast.error(message);
        return { success: false, error: message };
      } finally {
        setUpdating(false);
      }
    },
    [router, t, surface],
  );

  const updateItem = useCallback(
    async (lineItemId: string, quantity: number) => {
      await mutateCart(
        () => updateCartItemAction(lineItemId, quantity, surface),
        t("failedToUpdateItem"),
      );
    },
    [mutateCart, t, surface],
  );

  const removeItem = useCallback(
    async (lineItemId: string) => {
      await mutateCart(
        () => removeCartItemAction(lineItemId, surface),
        t("failedToRemoveItem"),
      );
    },
    [mutateCart, t, surface],
  );

  // Re-fetch cart on navigation (e.g., after checkout completes, the stale
  // cart token will be cleared by getCart and the cart state will update).
  // On the order-placed page, skip refreshCart to avoid a race condition:
  // getCart() auto-clears the cart token cookie on error (completed order
  // is no longer a cart), which removes the only auth token guest users
  // have before getCheckoutOrder() can use it.
  useEffect(() => {
    if (pathname.includes("/order-placed/")) {
      setCart(null);
      setLoading(false);
      return;
    }
    refreshCart();
  }, [refreshCart, pathname]);

  const itemCount = useMemo<number>(
    () =>
      cart?.items?.reduce(
        (sum: number, item: LineItem) => sum + item.quantity,
        0,
      ) ?? 0,
    [cart],
  );

  const value = useMemo<CartContextType>(
    () => ({
      cart,
      loading,
      updating,
      itemCount,
      isOpen,
      openCart,
      closeCart,
      addItem,
      updateItem,
      removeItem,
      refreshCart,
    }),
    [
      cart,
      loading,
      updating,
      itemCount,
      isOpen,
      openCart,
      closeCart,
      addItem,
      updateItem,
      removeItem,
      refreshCart,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
