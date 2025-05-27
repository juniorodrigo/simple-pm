import { z } from "zod";
import { Role, Status } from "./base";

export const UserBaseSchema = z.object({
	id: z.string(),
	username: z.string(),
	email: z.string(),
	password: z.string(),
	name: z.string(),
	lastname: z.string(),
	areaId: z.string(),
	role: z.nativeEnum(Role),
	isActive: z.boolean(),
});

export const UserDisplaySchema = UserBaseSchema.extend({
	lastActivity: z.date().optional(),
}).omit({ password: true });

export type UserDisplay = z.infer<typeof UserDisplaySchema>;
