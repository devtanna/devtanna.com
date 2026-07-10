/* eslint-disable @next/next/no-img-element */
import type { Project } from "@/config/site";
import { emptyChart, type ProjectRevenue } from "@/lib/revenue/read";
import { MrrBadge } from "./MrrBadge";
import { StatusBadge } from "./StatusBadge";
import { RevenueChart } from "./RevenueChart";

/** The project site's favicon via Google's favicon service. */
function faviconUrl(url: string): string | null {
  try {
    return `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=64`;
  } catch {
    return null;
  }
}

export function ProjectCard({
  project,
  revenue,
}: {
  project: Project;
  revenue: ProjectRevenue | undefined;
}) {
  const hasBadge = !!revenue && revenue.mrrCents !== null;
  const chart = revenue?.chart.length ? revenue.chart : emptyChart();
  const stealth = !!project.stealth;
  // Favicon leaks the domain, so hide it in stealth mode.
  const favicon = !stealth && project.url ? faviconUrl(project.url) : null;
  const name = stealth ? project.name.replace(/\S/g, "•") : project.name;

  const inner = (
    <div className="h-full min-w-0 rounded-2xl bg-white p-6 shadow-card">
      <div className="flex items-center gap-2">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center text-lg">
          {favicon ? (
            <img
              src={favicon}
              alt=""
              width={24}
              height={24}
              className="h-6 w-6"
            />
          ) : (
            project.icon
          )}
        </span>
        <h2 className="min-w-0 flex-1 truncate text-base font-bold text-ink">
          {name}
        </h2>
        {hasBadge ? (
          <MrrBadge
            mrrCents={revenue!.mrrCents!}
            currency={revenue!.currency}
            type={project.stripe?.type}
          />
        ) : null}
        {stealth ? (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-slate-800 px-2 py-0.5 text-xs font-semibold text-slate-100">
            🥷 Stealth
          </span>
        ) : null}
        {project.status ? <StatusBadge status={project.status} /> : null}
      </div>

      <p className="mt-2 min-h-[2.844rem] text-sm leading-relaxed text-muted">
        {project.tagline || "\u00A0"}
      </p>

      <div className="mt-4">
        <RevenueChart data={chart} gradientId={`grad-${project.slug}`} />
      </div>
    </div>
  );

  if (project.url && !stealth) {
    return (
      <a
        href={project.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block min-w-0 transition hover:-translate-y-0.5"
      >
        {inner}
      </a>
    );
  }
  return inner;
}
