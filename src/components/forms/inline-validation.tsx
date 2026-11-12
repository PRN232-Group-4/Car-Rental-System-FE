"use client";

import { Children, Fragment, createContext, isValidElement, useContext, useId, useState } from "react";
import type { ChangeEvent, ComponentProps, ReactNode } from "react";
import { Select, type SelectOption } from "@/components/ui/Select";
import { ApiClientError } from "@/api/api-client";

export type FieldErrors = Record<string, string>;
const normalize = (key: string) => key.split(".").pop()!.replace(/[_-]/g, "").toLowerCase();

export function mapValidationErrors(data: unknown, fields: string[], aliases: Record<string, string> = {}) {
  const errors: FieldErrors = {};
  const remaining: string[] = [];
  // BE bọc ProblemDetails trong ApiResponse.error; vẫn nhận cả ProblemDetails trần.
  const body = data && typeof data === "object" ? (data as Record<string, unknown>) : null;
  const problem = body && typeof body.error === "object" && body.error !== null ? (body.error as Record<string, unknown>) : body;
  const raw = problem?.errors;
  if (!raw || typeof raw !== "object") return { errors, remaining };
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    const message = Array.isArray(value) ? value.filter((item) => typeof item === "string").join(" ") : typeof value === "string" ? value : "";
    if (!message) continue;
    const target = aliases[normalize(key)] ?? key;
    const field = fields.find((name) => normalize(name) === normalize(target));
    if (field) errors[field] = [errors[field], message].filter(Boolean).join(" ");
    else remaining.push(message);
  }
  return { errors, remaining };
}

export function useInlineValidation() {
  const [errors, setErrors] = useState<FieldErrors>({});
  const [form, setForm] = useState<HTMLFormElement | null>(null);
  const show = (next: FieldErrors) => {
    setErrors(next);
    const first = Array.from(form?.querySelectorAll<HTMLElement>("input,select,textarea,[data-validation-field]") ?? []).find((element) => {
      if (element.dataset.validationField) return !!next[element.dataset.validationField];
      const control = element as HTMLInputElement;
      return next[control.name || control.id] && control.type !== "hidden" && !control.disabled && !control.classList.contains("sr-only") && control.getClientRects().length;
    });
    // A custom Select keeps its native <select> hidden for FormData; focus its visible trigger instead.
    const hiddenName = first?.getAttribute("aria-hidden") === "true" ? (first as HTMLSelectElement).name : "";
    const trigger = hiddenName ? form?.querySelector<HTMLElement>(`[data-select-for="${CSS.escape(hiddenName)}"]`) : null;
    (trigger ?? first)?.focus();
  };
  return {
    errors, show,
    attach: setForm,
    clear: (name: string) => setErrors((current) => ({ ...current, [name]: "" })),
    setField: (name: string, message: string) => setErrors((current) => ({ ...current, [name]: message })),
    reset: () => setErrors({}),
    report: (error: unknown, aliases: Record<string, string> = {}): string => {
      const fields = Array.from(form?.elements ?? []).map((element) => {
        const control = element as HTMLInputElement;
        return control.name || control.id;
      }).filter(Boolean);
      fields.push(...Array.from(form?.querySelectorAll<HTMLElement>("[data-validation-field]") ?? []).map((element) => element.dataset.validationField!));
      const mapped = mapValidationErrors(error instanceof ApiClientError ? error.data : null, fields, aliases);
      show(mapped.errors);
      if (mapped.remaining.length) return mapped.remaining.join(" ");
      return Object.keys(mapped.errors).length ? "" : error instanceof Error ? error.message : "Không thể lưu thông tin. Vui lòng thử lại.";
    },
  };
}

type Validation = ReturnType<typeof useInlineValidation>;
const Context = createContext<FieldErrors>({});

export function ValidatedForm({ validation: { errors: fieldErrors, show, clear, attach }, validate, onSubmit, onChangeCapture, children, ...props }: Omit<ComponentProps<"form">, "ref"> & {
  validation: Validation;
  validate?: () => Record<string, string | undefined>;
}) {
  const submit: NonNullable<ComponentProps<"form">["onSubmit"]> = (event) => {
    event.preventDefault();
    const errors: FieldErrors = {};
    for (const element of Array.from(event.currentTarget.elements)) {
      if (!(element instanceof HTMLInputElement || element instanceof HTMLSelectElement || element instanceof HTMLTextAreaElement) || !element.willValidate) continue;
      const key = element.name || element.id;
      if (!key) continue;
      const validity = element.validity;
      if (validity.valueMissing || (element.required && !element.value.trim())) errors[key] = "Vui lòng điền hoặc chọn thông tin này.";
      else if (validity.typeMismatch) errors[key] = element.type === "email" ? "Vui lòng nhập địa chỉ email hợp lệ." : "Thông tin không đúng định dạng.";
      else if (validity.rangeUnderflow) errors[key] = `Giá trị phải từ ${element.getAttribute("min")} trở lên.`;
      else if (validity.rangeOverflow) errors[key] = `Giá trị không được vượt quá ${element.getAttribute("max")}.`;
      else if (!validity.valid) errors[key] = "Giá trị không hợp lệ. Vui lòng kiểm tra định dạng và độ dài.";
    }
    for (const [key, message] of Object.entries(validate?.() ?? {})) if (message) errors[key] = message;
    show(errors);
    if (!Object.values(errors).some(Boolean)) onSubmit?.(event);
  }
  return <Context.Provider value={fieldErrors}><form {...props} ref={attach} noValidate onSubmit={submit} onChangeCapture={(event) => {
    const control = event.target;
    if (control instanceof HTMLInputElement || control instanceof HTMLSelectElement || control instanceof HTMLTextAreaElement) clear(control.name || control.id);
    onChangeCapture?.(event);
  }}>{children}</form></Context.Provider>;
}

function useField(props: { name?: string; id?: string; className?: string; "aria-describedby"?: string }) {
  const validation = useContext(Context);
  const generatedId = useId();
  const id = props.id ?? generatedId;
  const error = validation[props.name || props.id || ""];
  return {
    error,
    errorId: `${id}-error`,
    attributes: {
      id,
      "aria-invalid": !!error,
      "aria-describedby": [props["aria-describedby"], error ? `${id}-error` : undefined].filter(Boolean).join(" ") || undefined,
      className: `${props.className ?? ""}${error ? " !border-danger ring-1 ring-danger" : ""}`,
    },
  };
}

export function InlineInput({ showError = true, ...props }: ComponentProps<"input"> & { showError?: boolean }) {
  const { error, errorId, attributes } = useField(props);
  return <><input {...props} {...attributes} />{showError && <ErrorText id={errorId} error={error} />}</>;
}
export function InlineError({ name, inputId }: { name: string; inputId?: string }) {
  const validation = useContext(Context);
  const id = useId();
  const error = validation[name];
  return <div data-validation-field={name} tabIndex={-1}>
    <ErrorText id={`${inputId ?? id}-error`} error={error} />
  </div>;
}
const textOf = (node: ReactNode): string =>
  Children.toArray(node)
    .map((child) =>
      typeof child === "string" || typeof child === "number"
        ? String(child)
        : isValidElement(child)
          ? textOf((child.props as { children?: ReactNode }).children)
          : "",
    )
    .join("");

/** Reads <option>/<optgroup> children (fragments and arrays included) into Select options. */
function optionsFromChildren(children: ReactNode): SelectOption[] {
  const options: SelectOption[] = [];
  const walk = (node: ReactNode) =>
    Children.forEach(node, (child) => {
      if (!isValidElement(child)) return;
      const props = child.props as ComponentProps<"option">;
      if (child.type === Fragment || child.type === "optgroup") walk(props.children);
      else if (child.type === "option") {
        const text = textOf(props.children);
        options.push({ value: String(props.value ?? text), label: props.children, textValue: text, disabled: props.disabled });
      }
    });
  walk(children);
  return options;
}

/**
 * Form dropdown with inline error. Same call shape as a native <select> (option children, onChange(event)),
 * rendered with the shared Select; inside a form its hidden native select keeps name/required/FormData working.
 */
export function InlineSelect({ children, onChange, value, defaultValue, name, required, disabled, title, ...props }: ComponentProps<"select">) {
  const { error, errorId, attributes } = useField({ ...props, name });
  const emit = (next: string) => {
    const target = { name: name ?? "", id: attributes.id, value: next, type: "select-one" };
    onChange?.({ target, currentTarget: target } as unknown as ChangeEvent<HTMLSelectElement>);
  };
  return <>
    <Select
      options={optionsFromChildren(children)}
      value={value === undefined ? undefined : String(value)}
      defaultValue={defaultValue === undefined ? undefined : String(defaultValue)}
      onValueChange={emit}
      name={name}
      required={required}
      disabled={disabled}
      title={title}
      id={attributes.id}
      className={attributes.className}
      aria-label={props["aria-label"]}
      aria-invalid={attributes["aria-invalid"]}
      aria-describedby={attributes["aria-describedby"]}
      data-select-for={name}
    />
    <ErrorText id={errorId} error={error} />
  </>;
}
export function InlineTextarea(props: ComponentProps<"textarea">) {
  const { error, errorId, attributes } = useField(props);
  return <><textarea {...props} {...attributes} /><ErrorText id={errorId} error={error} /></>;
}
function ErrorText({ id, error }: { id: string; error?: string }) {
  return error ? <span id={id} role="alert" className="mt-2 block w-full text-sm font-normal text-danger">{error}</span> : null;
}
