/* eslint-disable @next/next/no-img-element */
import type { Project } from "@/config/site";
import type { ProjectRevenue } from "@/lib/revenue/read";
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
  const hasRevenue =
    revenue && revenue.mrrCents !== null && revenue.chart.length > 0;
  const favicon = project.url ? faviconUrl(project.url) : null;

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
          {project.name}
        </h2>
        {hasRevenue ? (
          <MrrBadge
            mrrCents={revenue!.mrrCents!}
            currency={revenue!.currency}
            type={project.stripe?.type}
          />
        ) : null}
        {project.status ? <StatusBadge status={project.status} /> : null}
      </div>

      <p className="mt-2 text-sm leading-relaxed text-muted">
        {project.tagline}
      </p>

      {hasRevenue ? (
        <div className="mt-4">
          <RevenueChart
            data={revenue!.chart}
            currency={revenue!.currency}
            gradientId={`grad-${project.slug}`}
          />
        </div>
      ) : null}
    </div>
  );

  if (project.url) {
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
