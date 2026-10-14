"use client";
import { InlineInput, InlineSelect, InlineTextarea } from "@/components/forms/inline-validation";
import { operationsInput } from "./api";

export interface OperationField { name: string; label: string; type?: "text" | "number" | "date" | "datetime-local" | "textarea"; required?: boolean; integer?: boolean; options?: { value: string; label: string }[] }
export default function OperationFields({ fields, values, change, prefix }: { fields: OperationField[]; values: Record<string, string>; change: (name: string, value: string) => void; prefix: string }) {
  return <div className="grid gap-4 sm:grid-cols-2">{fields.map((field) => {
    const id = `${prefix}-${field.name}`;
    const props = { id, name: field.name, value: values[field.name] ?? "", required: field.required, className: operationsInput, onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => change(field.name, event.target.value) };
    return <div key={field.name} className={field.type === "textarea" ? "sm:col-span-2" : ""}><label htmlFor={id} className="text-sm font-semibold">{field.label}{field.required ? " *" : ""}</label>{field.options ? <InlineSelect {...props}>{field.options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</InlineSelect> : field.type === "textarea" ? <InlineTextarea {...props} rows={4} /> : <InlineInput {...props} type={field.type ?? "text"} step={field.type === "number" ? field.integer ? "1" : "any" : undefined} />}</div>;
  })}</div>;
}
export const nullableNumber = (value: string) => value === "" ? null : Number(value);
