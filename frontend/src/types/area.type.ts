import { z } from "zod";

/**
 * Esquema base para un área
 */
export const AreaSchema = z.object({
	id: z.string().uuid(), // Asumiendo que es un UUID
	name: z.string().min(1).max(100),
	isActive: z.boolean(),
});

export type Area = z.infer<typeof AreaSchema>;

/**
 * Esquema para crear un área nueva
 */
export const AreaCreateSchema = AreaSchema.pick({ name: true });
export type AreaCreate = z.infer<typeof AreaCreateSchema>;

/**
 * Esquema para actualizar un área existente
 */
export const AreaUpdateSchema = z.object({
	id: AreaSchema.shape.id,
	name: AreaSchema.shape.name.optional(),
	isActive: AreaSchema.shape.isActive.optional(),
});
export type AreaUpdate = z.infer<typeof AreaUpdateSchema>;
