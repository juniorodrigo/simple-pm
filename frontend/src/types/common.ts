import { z } from "zod";

export const sResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
	z.object({
		success: z.boolean(),
		data: dataSchema.optional(),
		message: z.string().optional(),
	});

export type SResponse<T> = z.infer<ReturnType<typeof sResponseSchema<z.ZodType<T>>>>;

// Para seleccionables
export const selectListSchema = z.object({
	id: z.string(),
	nombre: z.string(),
});
export type SelectList = z.infer<typeof selectListSchema>;

export const selectListResponseSchema = z.object({
	data: z.array(selectListSchema),
	message: z.string().optional(),
	success: z.boolean(),
});
export type SelectListResponse = z.infer<typeof selectListResponseSchema>;
