import React, { Children, cloneElement, isValidElement, useId } from "react";
import type { ReactElement, ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface FormFieldProps {
  label: string;
  htmlFor?: string;
  required?: boolean;
  icon?: ReactNode;
  badge?: ReactNode;
  helperText?: string;
  error?: string;
  className?: string;
  children: ReactNode;
}

interface InjectionContext {
  fieldId: string;
  activeDescribedBy?: string;
  hasError: boolean;
}

function injectPrimaryControlProps(
  nodes: ReactNode,
  context: InjectionContext,
  alreadyInjected = false,
): { nodes: ReactNode; injected: boolean } {
  let injected = alreadyInjected;

  const mapped = Children.map(nodes, (child) => {
    if (!isValidElement(child)) {
      return child;
    }

    if (child.type === React.Fragment) {
      const fragmentProps = child.props as { children?: ReactNode };
      const result = injectPrimaryControlProps(fragmentProps.children, context, injected);
      injected = result.injected;
      return cloneElement(child as ReactElement<{ children?: ReactNode }>, {
        ...fragmentProps,
        children: result.nodes,
      });
    }

    if (!injected) {
      injected = true;
      const childProps = child.props as Record<string, unknown>;
      const childId =
        typeof childProps.id === "string" && childProps.id.trim()
          ? childProps.id
          : undefined;
      const childAriaInvalid = childProps["aria-invalid"] as
        | boolean
        | "true"
        | "false"
        | "grammar"
        | "spelling"
        | undefined;
      const childAriaDescribedBy =
        typeof childProps["aria-describedby"] === "string"
          ? childProps["aria-describedby"]
          : undefined;

      const combinedDescribedBy =
        [childAriaDescribedBy, context.activeDescribedBy].filter(Boolean).join(" ") || undefined;

      const resolvedAriaInvalid = context.hasError ? true : childAriaInvalid;

      const clonedProps: Record<string, unknown> = {
        id: childId ?? context.fieldId,
      };
      if (resolvedAriaInvalid !== undefined) {
        clonedProps["aria-invalid"] = resolvedAriaInvalid;
      }
      if (combinedDescribedBy !== undefined) {
        clonedProps["aria-describedby"] = combinedDescribedBy;
      }

      return cloneElement(child as ReactElement<Record<string, unknown>>, clonedProps);
    }

    return child;
  });

  return { nodes: mapped, injected };
}

export function FormField({
  label,
  htmlFor,
  required = false,
  icon,
  badge,
  helperText,
  error,
  className,
  children,
}: FormFieldProps) {
  const generatedId = useId();
  const fieldId = htmlFor ?? generatedId;
  const helperId = `${fieldId}-helper`;
  const errorId = `${fieldId}-error`;

  const activeDescribedBy = error ? errorId : helperText ? helperId : undefined;
  const hasError = Boolean(error);

  const renderedChildren = injectPrimaryControlProps(children, {
    fieldId,
    activeDescribedBy,
    hasError,
  }).nodes;

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center justify-between gap-2">
        <label
          htmlFor={fieldId}
          className="flex items-center gap-2 text-sm font-semibold text-ink"
        >
          {icon && (
            <span className="text-ink-3 shrink-0" aria-hidden="true">
              {icon}
            </span>
          )}
          <span>{label}</span>
          {required && (
            <span className="text-danger" aria-hidden="true">
              *
            </span>
          )}
        </label>
        {badge && <div className="shrink-0">{badge}</div>}
      </div>

      <div className="relative">{renderedChildren}</div>

      {helperText && !error && (
        <p id={helperId} className="text-xs text-ink-3">
          {helperText}
        </p>
      )}

      {error && (
        <p id={errorId} role="alert" className="text-xs font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

export default FormField;
