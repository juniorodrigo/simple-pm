import { ActivityPriority, ActivityStatus } from "./enums";
import { BaseUser } from "./user.type";

export type BaseActivity = {
	id: string;
	title: string;
	description?: string;
	stageId: string;
	projectId: number;
	status: ActivityStatus;
	priority: ActivityPriority;
	assignedToUser: BaseUser;
	startDate: Date;
	endDate: Date;
};
