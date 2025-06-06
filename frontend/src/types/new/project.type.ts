import { z } from "zod";
import { BaseStage } from "../stage.type";
import { User } from "./usuario.type";

const ProjectSchema = z.object({
	id: z.number(),
	name: z.string(),
	description: z.string().optional(),
	startDate: z.date(),
	endDate: z.date(),
	realStartDate: z.date().optional(),
	realEndDate: z.date().optional(),
	managerUserName: z.string(),
	managerUserId: z.string(),
	categoryName: z.string().optional(),
	categoryId: z.string().optional(),
	categoryColor: z.string().optional(),
	progressPercentage: z.number(),
	activitiesCount: z.number().optional(),
	team: z.array(z.any()), // Se definirá como User[] en el tipo inferido
	status: z.string().optional(),
	manager: z.any().optional(), // Se definirá como User en el tipo inferido
	previousProjectId: z.string().optional(),
	archived: z.boolean().optional(),
});

export type Project = z.infer<typeof ProjectSchema> & {
	team: User[];
	manager?: User;
};

export const ProjectCreateSchema = ProjectSchema.omit({ id: true }).extend({
	id: z.number().optional(), // Para casos donde el frontend asigna un ID temporal
});

export type ProjectCreate = z.infer<typeof ProjectCreateSchema> & {
	team: User[];
	manager?: User;
};

export const ProjectUpdateSchema = ProjectSchema.partial().extend({
	id: z.number(),
});

export type ProjectUpdate = z.infer<typeof ProjectUpdateSchema> & {
	team?: User[];
	manager?: User;
};

export type ExtendedProject = Project & {
	stages?: BaseStage[];
};

// Mantenemos BaseProject como alias para compatibilidad durante la transición
export type BaseProject = Project;
