export const COLORS = [
	{ name: "Rojo", value: "red" },
	{ name: "Verde", value: "green" },
	{ name: "Azul", value: "blue" },
	{ name: "Ámbar", value: "amber" },
	{ name: "Violeta", value: "violet" },
	{ name: "Rosa", value: "rose" },
	{ name: "Gris", value: "gray" },
] as const;

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
