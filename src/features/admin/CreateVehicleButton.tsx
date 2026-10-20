"use client";

import { useCallback, useState } from "react";
import { CirclePlus } from "lucide-react";
import VehicleForm from "./VehicleForm";

export default function CreateVehicleButton({ onSaved }: { onSaved?: () => void }) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  return <>
    <button
      type="button"
      onClick={() => setOpen(true)}
      style={{ color: "var(--on-primary)" }}
      className="inline-flex items-center justify-center gap-2 rounded bg-td-oxide px-4 py-3 text-sm font-semibold transition hover:bg-td-oxide-hover cursor-pointer"
    >
      <CirclePlus className="h-4 w-4" /> Thêm phương tiện
    </button>
    {open && <VehicleForm onClose={close} onSaved={() => { close(); onSaved?.(); }} />}
  </>;
}
