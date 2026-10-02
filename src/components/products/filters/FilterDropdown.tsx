"use client";

import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface FilterDropdownProps {
  label: string;
  badgeCount?: number;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  children: React.ReactNode;
  align?: "left" | "right";
}

export function FilterDropdown({
  label,
  badgeCount,
  isOpen,
  onToggle,
  onClose,
  children,
  align = "left",
}: FilterDropdownProps) {
  const hasActive = badgeCount !== undefined && badgeCount > 0;

  return (
    <DropdownMenu
      open={isOpen}
      onOpenChange={(open) => {
        if (open) onToggle();
        else onClose();
      }}
    >
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          aria-expanded={isOpen}
          aria-haspopup="menu"
          size="sm"
          className="rounded-[var(--marketplace-radius-sm)] border-marketplace-border bg-marketplace-surface text-marketplace-foreground shadow-none hover:bg-marketplace-surface-subtle"
        >
          <span>{label}</span>
          {hasActive && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-marketplace-brand text-xs text-marketplace-brand-foreground">
              {badgeCount}
            </span>
          )}
          <ChevronDown
            className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align={align === "right" ? "end" : "start"}>
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
