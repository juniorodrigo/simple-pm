import { z } from "zod";
import { Role } from "../base";

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

// Tipos adicionales para la UI
export interface RoleDefinition {
	id: Role;
	name: string;
	description: string;
	permissions: string[];
}

export interface DisplayUser {
	id: string;
	name: string;
	lastname: string;
	email: string;
	role: Role;
	isActive: boolean;
	area: {
		id: string;
		name: string;
	};
	lastActive?: Date;
}

export interface UserFormData {
	name: string;
	lastname: string;
	email: string;
	role: Role;
	isActive: boolean;
	areaId: string;
	area: {
		id: string;
		name: string;
	};
}

export interface UserModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	roles: RoleDefinition[];
	user: UserFormData;
	onUserChange: (user: UserFormData) => void;
	onSubmit: () => void;
	isLoading: boolean;
	mode: "create" | "edit";
}
