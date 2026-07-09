import { site } from "@/config/site";
import { getRevenue } from "@/lib/revenue/read";
import { ProfileHeader } from "@/components/ProfileHeader";
import { ProjectCard } from "@/components/ProjectCard";

// Revalidate the page periodically so it reflects the latest synced revenue.
export const revalidate = 3600;

export default async function Home() {
  const { bySlug, totalMrrCents, currency } = await getRevenue();

  return (
    <main className="mx-auto min-h-screen w-full max-w-page px-6 py-12 md:py-20">
      <div className="grid gap-10 md:grid-cols-[300px_1fr] md:gap-16">
        <div className="md:sticky md:top-20 md:self-start">
          <ProfileHeader totalMrrCents={totalMrrCents} currency={currency} />
        </div>

        <div className="grid auto-rows-max gap-5 sm:grid-cols-2">
          {site.projects.map((project) => (
            <ProjectCard
              key={project.slug}
              project={project}
              revenue={bySlug[project.slug]}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
