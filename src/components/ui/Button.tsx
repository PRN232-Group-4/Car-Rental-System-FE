"use client";

import React, { forwardRef } from "react";
import { Loader2 } from "lucide-react";

export type ButtonVariant = "primary" | "secondary" | "secondary-stage" | "ghost" | "danger";
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
  // Height and sizing per A6 & A40: control 10px radius, 44-48px height for md
  const sizeClasses = {
    sm: "h-9 px-3.5 text-xs font-semibold rounded-[var(--r-control)] gap-1.5",
    md: "h-11 sm:h-12 px-5 text-sm sm:text-base font-bold rounded-[var(--r-control)] gap-2",
    lg: "h-13 px-7 text-base font-extrabold rounded-[var(--r-control)] gap-2.5",
  }[size];

  // Variants per A6, A40
  const variantClasses = {
    primary:
      "bg-primary hover:bg-primary-hover active:bg-primary-press text-white shadow-e1 hover:shadow-e2 active:translate-y-px transition-all duration-160 cursor-pointer disabled:bg-sunken disabled:text-ink-3 disabled:shadow-none disabled:cursor-not-allowed",
    secondary:
      "bg-surface hover:bg-sunken text-ink border border-line-strong hover:border-ink-2 shadow-e1 active:translate-y-px transition-all duration-160 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed",
    "secondary-stage":
      "glass-1 hover:bg-white/70 text-ink shadow-e1 active:translate-y-px transition-all duration-160 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed",
    ghost:
      "bg-transparent hover:bg-sunken text-ink active:translate-y-px transition-colors duration-160 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
    danger:
      "bg-danger hover:bg-[#991b1b] text-white shadow-e1 active:translate-y-px transition-all duration-160 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed",
  }[variant];

  const isDisabled = disabled || isLoading;
  const isButton = Component === "button";

  return (
    <Component
      ref={ref}
      disabled={isButton ? isDisabled : undefined}
      aria-disabled={isDisabled}
      className={`inline-flex items-center justify-center select-none font-sans outline-none focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 ${sizeClasses} ${variantClasses} ${className}`.trim()}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" aria-hidden="true" />
      ) : (
        leftIcon && <span className="shrink-0" aria-hidden="true">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && (
        <span className="shrink-0" aria-hidden="true">{rightIcon}</span>
      )}
    </Component>
  );
});

export default Button;
