import { CirclePlay, Eye, LogOut, PauseCircle, Pencil, Trash2 } from "lucide-react";

/** One semantic icon per table action. Add new actions here instead of overriding icons in a page. */
export const rowActionRules = {
  view: { icon: Eye, tone: "default" },
  edit: { icon: Pencil, tone: "default" },
  delete: { icon: Trash2, tone: "danger" },
  activate: { icon: CirclePlay, tone: "default" },
  deactivate: { icon: PauseCircle, tone: "default" },
  revokeSessions: { icon: LogOut, tone: "default" },
} as const;

export type AdminRowActionKind = keyof typeof rowActionRules;
