import { BaseStage } from "./stage.type";
import { BaseUser } from "./user.type";

export type BaseProject = {
	id: number;
	name: string;
	description?: string;
	startDate: Date;
	endDate: Date;
	managerUserName: string; // Ahora requerido
	managerUserId: string; // Ahora requerido
	categoryName?: string;
	categoryId?: string;
	categoryColor?: string;
	progressPercentage?: number;
	activitiesCount?: number;
	team: BaseUser[];
};

export type ExtendedProject = BaseProject & {
	stages?: BaseStage[];
};
