"use client";

import React, { forwardRef, useRef, useImperativeHandle } from "react";
import { Loader2 } from "lucide-react";
import { useMagneticHover } from "@/lib/motion/hover";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "secondary-stage"
  | "ghost"
  | "danger"
  | "sticky-morph"
  | "amber-hero"
  | "marketing-cta"
  | "filter-pill";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonBaseProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  as?: React.ElementType;
  href?: string;
}

export type ButtonProps = ButtonBaseProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> &
  React.AnchorHTMLAttributes<HTMLAnchorElement>;

/**
 * Nút dùng chung mọi cổng. Hình khối và mực lấy theo Transit Desk (admin):
 * bo 4px, phẳng, không shadow, không dịch chuyển khi hover; màu CTA theo portal.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "primary",
    size = "md",
    isLoading = false,
    leftIcon,
    rightIcon,
    className = "",
    disabled,
    as: Component = "button",
    children,
    ...props
  },
  ref
) {
  const sizeClasses = {
    sm: "min-h-9 px-3 py-1.5 text-xs font-bold rounded gap-1.5",
    md: "min-h-10 px-4 py-2 text-[13px] font-bold rounded gap-2",
    lg: "min-h-11 px-5 py-2.5 text-sm font-bold rounded gap-2",
  }[size];

  const variantClasses = {
    primary:
      "bg-primary text-white hover:bg-primary-hover transition-colors cursor-pointer disabled:bg-td-chalk disabled:text-td-muted disabled:cursor-not-allowed",
    "amber-hero":
      "bg-primary text-white shadow-[0_10px_24px_-8px_rgba(180,83,9,0.45)] hover:bg-primary-hover transition-colors cursor-pointer disabled:bg-td-chalk disabled:text-td-muted disabled:cursor-not-allowed",
    "marketing-cta":
      "relative overflow-hidden bg-accent-500 text-stage-ink hover:bg-accent-700 hover:text-white active:translate-y-[1px] transition-all cursor-pointer font-bold disabled:bg-td-chalk disabled:text-td-muted disabled:cursor-not-allowed",
    "sticky-morph":
      "bg-stage-ink text-white hover:bg-primary transition-colors cursor-pointer",
    "filter-pill":
      "rounded-full bg-td-white text-td-ink border border-td-rule hover:border-td-ink transition-colors cursor-pointer",
    secondary:
      "border border-td-rule bg-transparent text-td-ink hover:bg-td-chalk transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed",
    "secondary-stage":
      "border border-td-rule bg-td-white text-td-ink hover:bg-td-chalk transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed",
    ghost:
      "bg-transparent text-td-ink hover:bg-td-chalk transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
    danger:
      "bg-danger text-white hover:bg-danger-hover transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed",
  }[variant];

  const isDisabled = disabled || isLoading;
  const isButton = Component === "button";

  const internalRef = useRef<HTMLButtonElement | null>(null);
  useImperativeHandle(ref, () => internalRef.current as HTMLButtonElement);

  // Cung cấp phản hồi xúc giác vật lý cao cấp, kích thích hành vi nhấp chuột.
  const isMagnetic = variant === "marketing-cta" && !isDisabled;
  const { onMouseMove: magneticMouseMove, onMouseLeave: magneticMouseLeave } = useMagneticHover(
    internalRef,
    isMagnetic
  );

  return (
    <Component
      ref={internalRef}
      disabled={isButton ? isDisabled : undefined}
      aria-disabled={isDisabled}
      onMouseMove={(e: React.MouseEvent<HTMLButtonElement>) => {
        if (isMagnetic) magneticMouseMove(e);
        props.onMouseMove?.(e as any);
      }}
      onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
        if (isMagnetic) magneticMouseLeave();
        props.onMouseLeave?.(e as any);
      }}
      className={`inline-flex select-none items-center justify-center whitespace-nowrap font-sans outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${sizeClasses} ${variantClasses} ${className}`.trim()}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden="true" />
      ) : (
        leftIcon && <span className="shrink-0" aria-hidden="true">{leftIcon}</span>
      )}
      {children}
      {!isLoading && rightIcon && (
        <span className="shrink-0" aria-hidden="true">{rightIcon}</span>
      )}
    </Component>
  );
});

export default Button;
