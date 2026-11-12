"use client";

import { useState, type ReactNode } from "react";
import * as RSelect from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";

export interface SelectOption {
  value: string;
  label: ReactNode;
  /** Plain text for type-ahead when `label` is not a string. */
  textValue?: string;
  disabled?: boolean;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Trigger text while nothing is chosen (and no option has the value ""). */
  placeholder?: string;
  /** Small heading at the top of the open panel, e.g. "Trạm tiếp nhận". */
  menuLabel?: string;
  /** Leading icon inside the trigger. */
  icon?: ReactNode;
  /** Inside a <form>, a hidden native select carries `name`/`required` for FormData and validity. */
  name?: string;
  required?: boolean;
  disabled?: boolean;
  id?: string;
  /** Trigger classes; merged over the default field look. */
  className?: string;
  contentClassName?: string;
  title?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean | "true" | "false";
  "data-select-for"?: string;
}

// Radix forbids "" as an item value; "" options are carried under this key and mapped back.
const EMPTY = "__select_empty__";

/**
 * Shared dropdown: paper trigger, ink panel with a sun-highlighted choice (the landing booking dock's picker).
 * Use it instead of a native <select>. Forms go through `InlineSelect`, which wraps this.
 */
export function Select({
  options,
  value,
  defaultValue,
  onValueChange,
  placeholder = "Chọn",
  menuLabel,
  icon,
  name,
  required,
  disabled,
  id,
  className,
  contentClassName,
  title,
  "data-select-for": selectFor,
  ...aria
}: SelectProps) {
  const [inner, setInner] = useState(defaultValue ?? "");
  const current = value ?? inner;
  const emptyOption = options.find((o) => o.value === "");

  return (
    <RSelect.Root
      // "" stays "" so the hidden native select reports valueMissing for required fields.
      value={current}
      onValueChange={(next) => {
        const out = next === EMPTY ? "" : next;
        if (value === undefined) setInner(out);
        onValueChange?.(out);
      }}
      name={name}
      required={required}
      disabled={disabled}
    >
      <RSelect.Trigger
        id={id}
        title={title}
        data-select-for={selectFor}
        {...aria}
        className={cn(
          "inline-flex h-10 w-full min-w-0 items-center gap-2 border border-line bg-surface px-3 text-left text-sm text-ink transition-colors cursor-pointer",
          "hover:border-line-strong focus:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 data-[state=open]:border-primary",
          "data-[placeholder]:text-ink-3 disabled:cursor-not-allowed disabled:opacity-60",
          className,
        )}
      >
        {icon}
        <span className="min-w-0 flex-1 truncate">
          <RSelect.Value placeholder={emptyOption ? emptyOption.label : placeholder} />
        </span>
        <RSelect.Icon asChild>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-60" aria-hidden="true" />
        </RSelect.Icon>
      </RSelect.Trigger>

      <RSelect.Portal>
        <RSelect.Content
          position="popper"
          align="start"
          sideOffset={6}
          className={cn(
            "z-[80] min-w-[var(--radix-select-trigger-width)] max-w-[min(26rem,calc(100vw-2rem))]",
            "max-h-[min(22rem,var(--radix-select-content-available-height))] overflow-hidden",
            "border border-bone-100/20 bg-ink-950 p-2 text-bone-100 shadow-2xl",
            contentClassName,
          )}
        >
          <RSelect.Viewport>
            {menuLabel && (
              <RSelect.Group>
                <RSelect.Label className="mb-1 border-b border-bone-100/10 px-2 pb-2 pt-1 font-mono text-xs uppercase text-sun-400">
                  {menuLabel}
                </RSelect.Label>
              </RSelect.Group>
            )}
            {options.map((option) => (
              <RSelect.Item
                key={option.value || EMPTY}
                value={option.value === "" ? EMPTY : option.value}
                textValue={option.textValue ?? (typeof option.label === "string" ? option.label : undefined)}
                disabled={option.disabled}
                className={cn(
                  "relative flex cursor-pointer select-none items-center justify-between gap-3 px-3 py-2 text-xs font-semibold uppercase tracking-tight text-bone-100 outline-none",
                  "data-[highlighted]:bg-ink-800 data-[state=checked]:bg-sun-600 data-[state=checked]:text-white",
                  "data-[disabled]:pointer-events-none data-[disabled]:opacity-40",
                )}
              >
                <RSelect.ItemText>{option.label}</RSelect.ItemText>
                <RSelect.ItemIndicator>
                  <Check className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                </RSelect.ItemIndicator>
              </RSelect.Item>
            ))}
          </RSelect.Viewport>
        </RSelect.Content>
      </RSelect.Portal>
    </RSelect.Root>
  );
}

export default Select;
