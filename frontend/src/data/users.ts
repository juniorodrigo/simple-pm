export interface User {
	id: string;
	name: string;
	lastname: string;
	email: string;
	password: string;
	role: "editor" | "admin" | "viewer" | "gerente_area" | "gerente_general";
	area: {
		id: string;
		name: string;
	};
}
