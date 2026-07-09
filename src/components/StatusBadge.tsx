import type { ProjectStatus } from "@/config/site";

const STATUS: Record<
  ProjectStatus,
  { label: string; emoji: string; className: string }
> = {
  active: { label: "Active", emoji: "", className: "bg-green-100 text-green-700" },
  building: { label: "Building...", emoji: "🚧", className: "bg-blue-100 text-blue-700" },
  acquired: { label: "Acquired", emoji: "💰", className: "bg-indigo-100 text-indigo-700" },
  discontinued: { label: "Discontinued", emoji: "", className: "bg-red-100 text-red-600" },
};

export function StatusBadge({ status }: { status: ProjectStatus }) {
  const s = STATUS[status];
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${s.className}`}
    >
      {s.emoji ? <span>{s.emoji}</span> : null}
      {s.label}
    </span>
  );
}
