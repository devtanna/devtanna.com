import { site } from "@/config/site";
import { getRevenue } from "@/lib/revenue/read";
import { ProfileHeader } from "@/components/ProfileHeader";
import { ProjectCard } from "@/components/ProjectCard";

// Revalidate the page periodically so it reflects the latest synced revenue.
export const revalidate = 3600;

export default async function Home() {
  const { bySlug, totalMrrCents, currency } = await getRevenue();

  return (
    <main className="mx-auto min-h-screen w-full max-w-page px-5 pb-24 pt-10 sm:pt-14">
      <ProfileHeader totalMrrCents={totalMrrCents} currency={currency} />

      <hr className="my-8 border-t border-black/10" />

      <div className="space-y-5">
        {site.projects.map((project) => (
          <ProjectCard
            key={project.slug}
            project={project}
            revenue={bySlug[project.slug]}
          />
        ))}
      </div>
    </main>
  );
}
