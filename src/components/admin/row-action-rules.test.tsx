import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { CirclePlay, Eye, PauseCircle, Pencil, Trash2 } from "lucide-react";
import { AdminRowAction } from "./AdminRowAction";
import { rowActionRules } from "./row-action-rules";

vi.mock("@/components/navigation/NavigationLink", () => ({
  default: (props: React.ComponentPropsWithoutRef<"a">) => React.createElement("a", props),
}));

describe("semantic table actions", () => {
  it("uses an eye for viewing, a pencil for editing and a trash bin for deletion", () => {
    expect(rowActionRules.view.icon).toBe(Eye);
    expect(rowActionRules.edit.icon).toBe(Pencil);
    expect(rowActionRules.delete.icon).toBe(Trash2);
    expect(rowActionRules.delete.tone).toBe("danger");
    expect(rowActionRules.activate.icon).toBe(CirclePlay);
    expect(rowActionRules.deactivate.icon).toBe(PauseCircle);
  });

  it("renders only an icon with an accessible name, tooltip and keyboard focus styling", () => {
    const html = renderToStaticMarkup(<AdminRowAction action="edit" label="Sửa Toyota Vios" />);
    expect(html).toContain('aria-label="Sửa Toyota Vios"');
    expect(html).toContain('title="Sửa Toyota Vios"');
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain("focus-visible:outline-primary");
    expect(html).not.toContain(">Sửa Toyota Vios<");
    expect(html).toContain('type="button"');
  });

  it("keeps disabled and pending actions inaccessible to repeated submissions", () => {
    const loading = renderToStaticMarkup(<AdminRowAction action="delete" label="Xóa xe" isLoading />);
    const disabled = renderToStaticMarkup(<AdminRowAction action="delete" label="Xóa xe" disabled />);
    expect(loading).toContain('disabled=""');
    expect(loading).toContain('aria-busy="true"');
    expect(loading).toContain("motion-reduce:animate-none");
    expect(disabled).toContain('disabled=""');
    expect(disabled).toContain("text-danger");
  });

  it("keeps a view action as a navigation link with its original URL", () => {
    const html = renderToStaticMarkup(<AdminRowAction action="view" label="Mở đơn thuê" href="/admin/rentals?rentalId=7" />);
    expect(html).toContain('href="/admin/rentals?rentalId=7"');
    expect(html).toContain('aria-label="Mở đơn thuê"');
    expect(html).toContain("lucide-eye");
    expect(html).not.toContain("<button");
  });
});
