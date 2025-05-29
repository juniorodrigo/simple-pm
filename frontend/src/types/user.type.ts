import { z } from "zod";
import { Role } from "./base";

const UserAreaSchema = z.object({
	id: z.string(),
	name: z.string(),
});

export const UserSchema = z.object({
	id: z.string(),
	email: z.string(),
	// password: z.string(),
	name: z.string(),
	lastname: z.string(),
	area: UserAreaSchema,
	role: z.nativeEnum(Role),
	isActive: z.boolean(),
});

export type User = z.infer<typeof UserSchema>;

export const UserCreateSchema = UserSchema.omit({ id: true, area: true }).extend({
	areaId: z.string(),
});
export type UserCreate = z.infer<typeof UserCreateSchema>;

export const UserUpdateSchema = UserSchema.omit({ id: true }).partial();
export type UserUpdate = z.infer<typeof UserUpdateSchema>;
