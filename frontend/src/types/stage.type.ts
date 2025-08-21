import { BaseActivity } from "./activity.type";
import { Colors } from "./enums";

export type BaseStage = {
	name: string;
	description?: string;
	color: Colors | null;
	colorHex?: string;
	ordinalNumber: number;
	id: string;
	projectId: number;

	activitiesCount?: number;
	activities?: BaseActivity[];
};
