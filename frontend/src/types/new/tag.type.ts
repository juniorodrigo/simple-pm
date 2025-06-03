import { Colors } from "../enums";

export type Tag = {
	id: string;
	name: string;
	createdAt?: Date;
	updatedAt?: Date;
	deletedAt?: Date | null;
	color: Colors;
};

export type TagCreate = {
	name: string;
	color: Colors;
};

export type TagUpdate = {
	id: string;
	name: string;
	color: Colors;
};
