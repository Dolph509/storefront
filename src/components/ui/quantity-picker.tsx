"use client";

import { Minus, Plus } from "lucide-react";
import * as React from "react";
import { Button } from "./button";

export interface QuantityPickerProps {
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  decrementLabel: string;
  incrementLabel: string;
  quantityLabel: string;
  disabled?: boolean;
  size?: "sm" | "lg";
  variant?: "stepper" | "dropdown";
  className?: string;
}

export function QuantityPicker({
  quantity,
  onQuantityChange,
  decrementLabel,
  incrementLabel,
  quantityLabel,
  disabled = false,
  size = "sm",
  variant = "stepper",
  className,
}: QuantityPickerProps): React.JSX.Element {
  // Holds raw text while editing the stepper; the dropdown uses the same
  // component instance so keep this hook unconditional across variants.
  const [draft, setDraft] = React.useState<string | null>(null);

  if (variant === "dropdown") {
    const options = Array.from({ length: 10 }, (_, index) => index + 1);
    if (quantity > 10) options.push(quantity);
    return (
      <select
        aria-label={quantityLabel}
        className={
          className ??
          "h-9 w-full rounded-lg border border-marketplace-border bg-marketplace-surface px-2.5 text-sm font-medium text-marketplace-foreground transition-[border-color,box-shadow] duration-150 ease-out focus:border-marketplace-brand focus:outline-none focus:ring-2 focus:ring-marketplace-brand/20 disabled:cursor-not-allowed disabled:opacity-50"
        }
        disabled={disabled}
        value={quantity}
        onChange={(event) => onQuantityChange(Number(event.target.value))}
      >
        {options.map((value) => (
          <option key={value} value={value}>
            {value}
          </option>
        ))}
      </select>
    );
  }

  // Holds the raw text while the user is typing; null means "not editing",
  // so the displayed value tracks the quantity prop between edits without
  // needing an effect to sync them.
  const commitDraft = () => {
    if (draft === null) return;
    setDraft(null);
    const parsed = Number.parseInt(draft, 10);
    if (Number.isNaN(parsed)) return;
    const next = Math.max(1, parsed);
    if (next !== quantity) {
      onQuantityChange(next);
    }
  };

  const buttonSize = size === "lg" ? "icon-lg" : "icon";
  const inputClass =
    size === "lg"
      ? "w-12 bg-transparent text-center font-medium tabular-nums outline-none disabled:opacity-50"
      : "w-10 bg-transparent py-2 text-center text-sm font-medium tabular-nums outline-none disabled:opacity-50";

  return (
    <div className="flex items-center rounded-[var(--marketplace-radius-sm)] border border-marketplace-border px-0.5 focus-within:border-marketplace-brand">
      <Button
        type="button"
        variant="ghost"
        size={buttonSize}
        className="rounded-md disabled:opacity-30"
        disabled={disabled || quantity <= 1}
        onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
        aria-label={decrementLabel}
      >
        <Minus className="w-3 h-3" />
      </Button>
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        autoComplete="off"
        value={draft ?? String(quantity)}
        disabled={disabled}
        aria-label={quantityLabel}
        className={inputClass}
        onChange={(e) => setDraft(e.target.value.replace(/\D/g, ""))}
        onFocus={(e) => e.target.select()}
        onBlur={commitDraft}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            e.currentTarget.blur();
          } else if (e.key === "Escape" && draft !== null) {
            // While editing, Escape cancels the edit and nothing else — the
            // picker can sit inside a dialog (the cart drawer) that would
            // otherwise dismiss on the same keypress.
            e.stopPropagation();
            setDraft(null);
          }
        }}
      />
      <Button
        type="button"
        variant="ghost"
        size={buttonSize}
        className="rounded-md disabled:opacity-30"
        disabled={disabled}
        onClick={() => onQuantityChange(quantity + 1)}
        aria-label={incrementLabel}
      >
        <Plus className="w-3 h-3" />
      </Button>
    </div>
  );
}
