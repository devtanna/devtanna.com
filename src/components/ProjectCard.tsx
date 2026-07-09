import type { Project } from "@/config/site";
import type { ProjectRevenue } from "@/lib/revenue/read";
import { MrrBadge } from "./MrrBadge";
import { RevenueChart } from "./RevenueChart";

export function ProjectCard({
  project,
  revenue,
}: {
  project: Project;
  revenue: ProjectRevenue | undefined;
}) {
  const hasRevenue =
    revenue && revenue.mrrCents !== null && revenue.chart.length > 0;

  const inner = (
    <div className="rounded-4xl bg-white p-6 shadow-card">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl"
            style={{ backgroundColor: project.iconBg ?? "#f3f4f6" }}
          >
            {project.icon}
          </span>
          <h2 className="truncate text-2xl font-extrabold text-ink">
            {project.name}
          </h2>
        </div>
        {hasRevenue ? (
          <MrrBadge
            mrrCents={revenue!.mrrCents!}
            currency={revenue!.currency}
          />
        ) : null}
      </div>

      <p className="mt-3 text-lg text-muted">{project.tagline}</p>

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
