import { Colors } from "./enums";

export type Tag = {
	id: string;
	name: string;
	createdAt?: Date;
	updatedAt?: Date;
	deletedAt?: Date | null;
	color: Colors;
};
