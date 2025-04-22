import { ActivityPriority, ActivityStatus } from "./enums";

export type BaseActivity = {
	id?: string;
	title: string;
	description?: string;
	stageId?: string;
	projectId?: string;
	status?: ActivityStatus;
	priority?: ActivityPriority;
	startDate?: Date;
	endDate?: Date;
};
