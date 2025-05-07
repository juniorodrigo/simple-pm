// app/projects/[id]/page.tsx
import ClientView from "./ClientView";
import { ProjectsService } from "@/services/project.service";
import { ExtendedProject } from "@/app/types/project.type";
import { BaseActivity } from "@/app/types/activity.type";

interface PageProps {
	// Next.js 15 inyecta params como Promise
	params: Promise<{ id: string }>;
}

export default async function ProjectPage({ params }: PageProps) {
	const { id } = await params;

	console.log(typeof id);

	const response = await ProjectsService.getSingleProject(id);
	if (!response.success || !response.data) {
		// Aquí podrías lanzar un error 404 o renderizar un UI de error más bonita
		return <div className="flex items-center justify-center h-screen">Proyecto no encontrado</div>;
	}

	const project: ExtendedProject = response.data;
	// Aplanamos las actividades para pasarlas a la capa de cliente
	const activities: BaseActivity[] = project.stages ? project.stages.flatMap((stage) => stage.activities || []) : [];

	return <ClientView project={project} activities={activities} />;
}
