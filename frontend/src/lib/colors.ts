export const COLORS = [
	{ name: "Rojo", value: "red" },
	{ name: "Verde", value: "green" },
	{ name: "Azul", value: "blue" },
	{ name: "Ámbar", value: "amber" },
	{ name: "Violeta", value: "violet" },
	{ name: "Rosa", value: "rose" },
	{ name: "Gris", value: "gray" },
] as const;

// Colores para los badges de prioridad
export const PRIORITY_COLORS = {
	low: "border-green-500 text-green-600",
	medium: "border-blue-500 text-blue-600",
	high: "border-orange-500 text-orange-600",
	critical: "border-red-500 text-red-600",
	default: "border-gray-500 text-gray-600",
};

// Colores para los fondos de prioridad
export const PRIORITY_BG_COLORS = {
	low: "bg-green-500",
	medium: "bg-blue-500",
	high: "bg-orange-500",
	critical: "bg-red-500",
	default: "bg-gray-500",
};

// Colores para los estados de actividades
export const STATUS_COLORS = {
	todo: "border-l-4 border-l-slate-400",
	in_progress: "border-l-4 border-l-blue-500",
	review: "border-l-4 border-l-purple-500",
	done: "border-l-4 border-l-green-500",
	default: "",
};

export function getPriorityColor(priority: string) {
	return PRIORITY_COLORS[priority as keyof typeof PRIORITY_COLORS] || PRIORITY_COLORS.default;
}

export function getPriorityBgColor(priority: string) {
	return PRIORITY_BG_COLORS[priority as keyof typeof PRIORITY_BG_COLORS] || PRIORITY_BG_COLORS.default;
}

export function getStatusColor(status: string) {
	return STATUS_COLORS[status as keyof typeof STATUS_COLORS] || STATUS_COLORS.default;
}

export function getTagColorClass(color: string) {
	switch (color) {
		case "red":
			return "bg-red-100 text-red-800 border-red-200";
		case "green":
			return "bg-green-100 text-green-800 border-green-200";
		case "blue":
			return "bg-blue-100 text-blue-800 border-blue-200";
		case "amber":
			return "bg-amber-100 text-amber-800 border-amber-200";
		case "violet":
			return "bg-violet-100 text-violet-800 border-violet-200";
		case "rose":
			return "bg-rose-100 text-rose-800 border-rose-200";
		case "gray":
			return "bg-gray-100 text-gray-800 border-gray-200";
		default:
			return "bg-gray-100 text-gray-800 border-gray-200";
	}
}

export function getStageColorValue(color: string) {
	if (!color) return "#6b7280"; // Color gris por defecto si no hay color

	switch (color.toLowerCase()) {
		case "red":
			return "#ef4444";
		case "green":
			return "#22c55e";
		case "blue":
			return "#3b82f6";
		case "amber":
			return "#eab308";
		case "violet":
			return "#a855f7";
		case "rose":
			return "#ec4899";
		case "gray":
			return "#6b7280";
		default:
			// Si ya es un valor hexadecimal, devolverlo directamente
			if (color.startsWith("#")) return color;
			return "#6b7280";
	}
}

export function getStageColorTailwind(color: string) {
	if (!color) return "bg-gray-500"; // Color gris por defecto si no hay color

	switch (color.toLowerCase()) {
		case "red":
			return "red-500";
		case "green":
			return "green-500";
		case "blue":
			return "blue-500";
		case "amber":
			return "amber-500";
		case "violet":
			return "violet-500";
		case "rose":
			return "rose-500";
		case "gray":
			return "gray-500";
		default:
			// Si ya es una clase de Tailwind, devolverla directamente
			if (color.startsWith("bg-")) return color;
			return "bg-base";
	}
}
