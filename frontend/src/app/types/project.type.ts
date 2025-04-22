import { BaseActivity } from "./activity.type";
import { BaseUser } from "./user.type";

export type BaseProject = {
	id?: string;
	name: string;
	description?: string;
	startDate: Date;
	endDate: Date;
	managerUserName?: string;
	managerUserId?: string;
	categoryName?: string;
	categoryId?: string;
	categoryColor?: string;
	progressPercentage?: number;
	activitiesCount?: number;
};

export type ExtendedProject = BaseProject & {
	activities?: BaseActivity[];
	team: BaseUser[];
};
