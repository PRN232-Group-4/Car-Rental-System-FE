"use client";

import React, { forwardRef } from "react";
import { Loader2 } from "lucide-react";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "secondary-stage"
  | "ghost"
  | "danger"
  | "sticky-morph"
  | "amber-hero"
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

  // Variants per A6, A40 with non-generic tactile physics, hairline specular rim
  const variantClasses = {
    primary:
      "bg-primary hover:bg-primary-hover active:bg-primary-press text-white shadow-e1 hover:shadow-e2 active:scale-[0.96] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer disabled:bg-sunken disabled:text-ink-3 disabled:shadow-none disabled:cursor-not-allowed disabled:transform-none border border-white/20",
    "amber-hero":
      "bg-primary hover:bg-primary-hover active:bg-primary-press text-white shadow-[0_8px_20px_-4px_rgba(180,83,9,0.35)] hover:shadow-[0_12px_24px_-6px_rgba(180,83,9,0.45)] active:scale-[0.96] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer disabled:bg-sunken disabled:text-ink-3 disabled:shadow-none disabled:cursor-not-allowed disabled:transform-none border border-white/25",
    "sticky-morph":
      "bg-stage-ink hover:bg-primary active:bg-primary-press text-white shadow-e1 hover:shadow-[0_8px_20px_-4px_rgba(180,83,9,0.35)] active:scale-[0.96] hover:-translate-y-0.5 transition-all duration-300 cursor-pointer border border-white/20",
    "filter-pill":
      "bg-surface hover:bg-stage-ink hover:text-white text-ink border border-line-strong hover:border-stage-ink rounded-full shadow-e1 active:scale-[0.96] transition-all duration-200 cursor-pointer",
    secondary:
      "bg-surface hover:bg-sunken text-ink border border-line-strong hover:border-ink-2 shadow-e1 active:scale-[0.96] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none",
    "secondary-stage":
      "glass-1 hover:bg-surface/70 text-ink shadow-e1 active:scale-[0.96] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none border border-white/30",
    ghost:
      "bg-transparent hover:bg-sunken text-ink active:scale-[0.96] transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none",
    danger:
      "bg-danger hover:bg-danger-hover text-white shadow-e1 active:scale-[0.96] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none",
  }[variant];

  const isDisabled = disabled || isLoading;
  const isButton = Component === "button";

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (typeof window === "undefined" || isDisabled) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) * 0.15;
    const y = (e.clientY - rect.top - rect.height / 2) * 0.15;
    e.currentTarget.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLElement>) => {
    if (typeof window === "undefined") return;
    e.currentTarget.style.transform = "";
  };

  return (
    <Component
      ref={ref}
      disabled={isButton ? isDisabled : undefined}
      aria-disabled={isDisabled}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
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
