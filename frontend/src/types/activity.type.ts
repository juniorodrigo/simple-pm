import { ActivityPriority, ActivityStatus } from "./enums";
import { User } from "./new/usuario.type";

// Tipo específico para usuarios asignados a actividades
export type ActivityUser = Pick<User, "id" | "name" | "lastname"> & {
	projectRole?: string;
};

export type BaseActivity = {
	id: string;
	title: string;
	description?: string;
	stageId: string;
	// projectId: number;
	status: ActivityStatus;
	priority: ActivityPriority;
	assignedToUser: ActivityUser;
	startDate: Date;
	endDate: Date;
	executedStartDate?: Date | undefined;
	executedEndDate?: Date | undefined;
};
