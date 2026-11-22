"use client";

import { useId } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export type SwatchSelectOption = {
  value: string;
  label: string;
  color?: string | null;
  imageUrl?: string | null;
  disabled?: boolean;
};

type SwatchSelectProps = {
  id?: string;
  label: string;
  value: string;
  placeholder: string;
  options: SwatchSelectOption[];
  disabled?: boolean;
  invalid?: boolean;
  onChange: (value: string) => void;
  className?: string;
};

function SwatchDot({
  color,
  imageUrl,
  className,
}: {
  color?: string | null;
  imageUrl?: string | null;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-block size-5 shrink-0 rounded-full border border-black/15",
        className,
      )}
      style={
        imageUrl
          ? {
              backgroundImage: `url(${imageUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }
          : { backgroundColor: color || "#d8d1c7" }
      }
    />
  );
}

export function SwatchSelect({
  id,
  label,
  value,
  placeholder,
  options,
  disabled = false,
  invalid = false,
  onChange,
  className,
}: SwatchSelectProps) {
  const generatedId = useId();
  const selectId = id || generatedId;
  const selected = options.find((option) => option.value === value);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={disabled}>
        <button
          id={selectId}
          type="button"
          aria-label={label}
          aria-invalid={invalid || undefined}
          className={cn(
            "pdp-reference-select flex w-full items-center gap-2.5 text-left",
            disabled && "cursor-not-allowed opacity-55",
            className,
          )}
        >
          {selected ? (
            <>
              <SwatchDot color={selected.color} imageUrl={selected.imageUrl} />
              <span className="min-w-0 flex-1 truncate">{selected.label}</span>
            </>
          ) : (
            <span className="min-w-0 flex-1 truncate text-[#6f6c68]">
              {placeholder}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-[14rem] p-1"
      >
        <DropdownMenuRadioGroup
          value={value}
          onValueChange={(next) => {
            if (next) onChange(next);
          }}
        >
          {options.map((option) => (
            <DropdownMenuRadioItem
              key={option.value}
              value={option.value}
              disabled={option.disabled}
              className="gap-2.5 py-2.5"
            >
              <SwatchDot color={option.color} imageUrl={option.imageUrl} />
              <span className="min-w-0 flex-1 truncate">{option.label}</span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
