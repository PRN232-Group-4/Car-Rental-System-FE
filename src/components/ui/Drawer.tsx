"use client";

import type { ReactNode } from "react";
import { Drawer as VaulDrawer } from "vaul";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

export interface DrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: ReactNode;
  description?: ReactNode;
  side?: "bottom" | "left" | "right";
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}

export function Drawer({
  open,
  onOpenChange,
  title,
  description,
  side = "bottom",
  children,
  className,
  bodyClassName,
}: DrawerProps) {
  const isBottom = side === "bottom";
  const isLeft = side === "left";
  const isRight = side === "right";

  return (
    <VaulDrawer.Root
      open={open}
      onOpenChange={onOpenChange}
      direction={side}
      dismissible
    >
      <VaulDrawer.Portal>
        <VaulDrawer.Overlay className="fixed inset-0 z-50 bg-scrim transition-opacity" />
        <VaulDrawer.Content
          aria-describedby={description ? "drawer-desc" : undefined}
          className={cn(
            "fixed z-50 flex flex-col bg-surface shadow-e3 transition-transform focus:outline-none",
            isBottom &&
              "inset-x-0 bottom-0 max-h-[85dvh] rounded-t-[20px] border-t border-line",
            isLeft &&
              "inset-y-0 left-0 h-full w-[min(88vw,320px)] border-r border-line",
            isRight &&
              "inset-y-0 right-0 h-full w-[min(88vw,320px)] border-l border-line",
            className,
          )}
        >
          {isBottom && (
            <div className="mx-auto mt-3 h-1.5 w-12 rounded-full bg-sunken" />
          )}

          {title ? (
            <div className="flex shrink-0 items-center justify-between border-b border-line px-5 py-4">
              <div>
                <VaulDrawer.Title className="text-base font-bold text-ink">
                  {title}
                </VaulDrawer.Title>
                {description && (
                  <VaulDrawer.Description
                    id="drawer-desc"
                    className="mt-0.5 text-xs text-ink-3"
                  >
                    {description}
                  </VaulDrawer.Description>
                )}
              </div>
              <VaulDrawer.Close asChild>
                <button
                  type="button"
                  aria-label="Đóng ngăn kéo"
                  className="rounded-xl border border-line p-1.5 text-ink-3 transition hover:bg-canvas hover:text-ink"
                >
                  <X className="h-4 w-4" />
                </button>
              </VaulDrawer.Close>
            </div>
          ) : (
            <VaulDrawer.Title className="sr-only">Bảng điều hướng</VaulDrawer.Title>
          )}

          <div
            className={cn(
              "flex-1 overflow-y-auto",
              title && "px-5 py-4",
              bodyClassName,
            )}
          >
            {children}
          </div>
        </VaulDrawer.Content>
      </VaulDrawer.Portal>
    </VaulDrawer.Root>
  );
}

export default Drawer;
