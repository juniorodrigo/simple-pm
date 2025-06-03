type SelectItem = {
	id: string;
	name: string;
};
import HOST from "@/lib/host";
import { SResponse } from "@/types/new/common";

export class SelectService {
	static async getAreas(): Promise<SResponse<SelectItem[]>> {
		try {
			const response = await fetch(`${HOST}/helpers/select/areas`);
			if (!response.ok) throw new Error("Failed to fetch areas");

			const payload = await response.json();
			if (!payload.success) throw new Error("Failed to fetch areas");

			return payload;
		} catch (error) {
			console.error("Error fetching areas:", error);
			return {
				success: false,
				message: "Error fetching areas",
				data: [],
			};
		}
	}
}
