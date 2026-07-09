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
    <div className="h-full rounded-2xl bg-white p-6 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center text-2xl">
            {favicon ? (
              <img
                src={favicon}
                alt=""
                width={32}
                height={32}
                className="h-8 w-8"
              />
            ) : (
              project.icon
            )}
          </span>
          <h2 className="truncate text-xl font-bold text-ink">
            {project.name}
          </h2>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {hasRevenue ? (
            <MrrBadge
              mrrCents={revenue!.mrrCents!}
              currency={revenue!.currency}
            />
          ) : null}
          {project.status ? <StatusBadge status={project.status} /> : null}
        </div>
      </div>

      <p className="mt-3 text-base leading-relaxed text-muted">
        {project.tagline}
      </p>

      {hasRevenue ? (
        <div className="mt-5">
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
        className="block transition hover:-translate-y-0.5"
      >
        {inner}
      </a>
    );
  }
  return inner;
}
