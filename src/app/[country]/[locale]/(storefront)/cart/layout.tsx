import { CartFooter } from "@/components/cart/CartFooter";

export default function CartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[calc(100dvh-8rem)] flex-col">
      <div className="flex-1 pb-10">{children}</div>
      <CartFooter />
    </div>
  );
}
