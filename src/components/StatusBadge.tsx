import { SM, sm } from "../constants";
import type { AdoptionStatus } from "../types";

export function StatusBadge({ status }: { status: AdoptionStatus }) {
  const { icon, label } = sm(status);
  return (
    <span className="badge" data-s={status}>
      {icon} {label}
    </span>
  );
}

export function statusIcon(status: AdoptionStatus): string {
  return SM[status]?.icon ?? "❓";
}

export function statusLabel(status: AdoptionStatus): string {
  return SM[status]?.label ?? status;
}
