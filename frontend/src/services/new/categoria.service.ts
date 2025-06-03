import { Tag, TagCreate, TagUpdate } from "@/types/new/tag.type";
import HOST from "@/lib/host";
import { SResponse } from "@/types/new/common";

export class CategoriaService {
	static async create(tag: TagCreate): Promise<SResponse<Tag>> {
		const response = await fetch(HOST + "/tags", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(tag),
		});
		if (!response.ok && response.status >= 500) throw new Error("Algo ocurrió mal al crear la etiqueta");

		const payload = await response.json();
		if (!payload.success) return { success: false, message: payload.message };

		return payload;
	}

	static async update(tag: TagUpdate): Promise<SResponse<Tag>> {
		const response = await fetch(HOST + `/tags/${tag.id}`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(tag),
		});

		if (!response.ok && response.status >= 500) throw new Error("Algo ocurrió mal al actualizar la etiqueta");

		const payload = await response.json();
		if (!payload.success) return { success: false, message: payload.message };

		return payload;
	}

	static async getAll(): Promise<SResponse<Tag[]>> {
		const response = await fetch(HOST + "/tags");
		if (!response.ok && response.status >= 500) throw new Error("Algo ocurrió mal al obtener las etiquetas");

		const payload = await response.json();
		if (!payload.success) return { success: false, message: payload.message };

		return payload;
	}

	static async delete(id: string): Promise<SResponse<any>> {
		const response = await fetch(HOST + `/tags/${id}`, {
			method: "DELETE",
		});

		if (!response.ok && response.status >= 500) throw new Error("Algo ocurrió mal al eliminar la etiqueta");

		const payload = await response.json();
		if (!payload.success) return { success: false, message: payload.message };

		return payload;
	}
}
