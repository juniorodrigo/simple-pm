// app/projects/[id]/page.tsx
import { Suspense } from "react";
import { ProjectsService } from "@/services/project.service";
import { ExtendedProject } from "@/app/types/project.type";
import { BaseActivity } from "@/app/types/activity.type";
import ProjectSkeleton from "@/components/project/project-skeleton";
import ClientView from "./ClientView";

interface PageProps {
	// Next.js 15 inyecta params como Promise
	params: Promise<{ id: string }>;
}

async function ProjectData({ id }: { id: string }) {
	const response = await ProjectsService.getSingleProject(id);

	if (!response.success || !response.data) {
		return <div className="flex items-center justify-center h-screen">Proyecto no encontrado</div>;
	}

	const project: ExtendedProject = response.data;
	const activities: BaseActivity[] = project.stages ? project.stages.flatMap((stage) => stage.activities || []) : [];

	return (
		<Suspense fallback={<ProjectSkeleton />}>
			<ClientView project={project} activities={activities} />
		</Suspense>
	);
}

export default async function ProjectPage({ params }: PageProps) {
	const { id } = await params;

	return (
		<Suspense fallback={<ProjectSkeleton />}>
			<ProjectData id={id} />
		</Suspense>
	);
}
