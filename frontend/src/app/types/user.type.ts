import { z } from "zod";
import { Role } from "./enums";

export type BaseUser = {
	id?: string;
	name: string;
	lastname: string;
	projectRole?: string;
};

export const UserSchema = z.object({
	id: z.string().cuid(),
	username: z.string(),
	email: z.string().email(),
	password: z.string().optional(),
	name: z.string(),
	lastname: z.string(),
	role: z.nativeEnum(Role).default(Role.EDITOR),
	createdAt: z
		.date()
		.nullable()
		.default(() => new Date()),
	updatedAt: z
		.date()
		.nullable()
		.default(() => new Date()),
	isActive: z.boolean().nullable().default(true),
	deletedAt: z.date().nullable(),
	UserAction: z.array(z.any()).optional(),
	Project: z.array(z.any()).optional(),
	ProjectMember: z.array(z.any()).optional(),
	lastActive: z.date().nullable(),
});

export type User = z.infer<typeof UserSchema>;
