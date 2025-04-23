import { BaseActivity } from "./activity.type";
import { Colors } from "./enums";

export type BaseStage = {
	name: string;
	description?: string;
	color: Colors;
	ordinalNumber: number;
	id: string;
	projectId: number;

	activitiesCount?: number;
	activities?: BaseActivity[];
};
