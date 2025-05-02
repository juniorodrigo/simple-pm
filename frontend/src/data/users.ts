export interface User {
	id: string;
	name: string;
	lastname: string;
	email: string;
	password: string;
	role: "editor" | "admin" | "viewer";
}

export const users: User[] = [
	{
		id: "1",
		name: "Admin",
		lastname: "User",
		email: "admin@ejemplo.com",
		password: "admin123",
		role: "admin",
	},
	{
		id: "2",
		name: "Editor",
		lastname: "User",
		email: "editor@ejemplo.com",
		password: "editor123",
		role: "editor",
	},
	{
		id: "3",
		name: "Viewer",
		lastname: "User",
		email: "viewer@ejemplo.com",
		password: "viewer123",
		role: "viewer",
	},
];
