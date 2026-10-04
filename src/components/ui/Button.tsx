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
  // Height and sizing per A6 & A40: control 10px radius, flexible min-height
  const sizeClasses = {
    sm: "min-h-[38px] px-3.5 py-2 text-xs font-semibold rounded-[var(--r-control)] gap-1.5",
    md: "min-h-[44px] px-5 py-2.5 text-sm sm:text-base font-bold rounded-[var(--r-control)] gap-2",
    lg: "min-h-[50px] px-7 py-3.5 text-base font-bold rounded-[var(--r-control)] gap-2.5",
  }[size];

  // Variants per A6, A40 with tactile physics and rim lights
  const variantClasses = {
    primary:
      "bg-primary hover:bg-primary-hover active:bg-primary-press text-white shadow-e1 hover:shadow-e2 active:scale-[0.98] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer disabled:bg-sunken disabled:text-ink-3 disabled:shadow-none disabled:cursor-not-allowed disabled:transform-none",
    secondary:
      "bg-surface hover:bg-sunken text-ink border border-line-strong hover:border-ink-2 shadow-e1 active:scale-[0.98] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none",
    "secondary-stage":
      "glass-1 hover:bg-white/70 text-ink shadow-e1 active:scale-[0.98] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none",
    ghost:
      "bg-transparent hover:bg-sunken text-ink active:scale-[0.98] transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none",
    danger:
      "bg-danger hover:bg-[#991b1b] text-white shadow-e1 active:scale-[0.98] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none",
  }[variant];

  const isDisabled = disabled || isLoading;
  const isButton = Component === "button";

  return (
    <Component
      ref={ref}
      disabled={isButton ? isDisabled : undefined}
      aria-disabled={isDisabled}
      className={`inline-flex items-center justify-center whitespace-nowrap select-none font-sans outline-none focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 ${sizeClasses} ${variantClasses} ${className}`.trim()}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" aria-hidden="true" />
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
