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
		name: "Wilfredo",
		lastname: "Melgar",
		email: "wmelgar@madridinmobiliaria.pe",
		password: "pmsystem",
		role: "admin",
	},
	{
		id: "2",
		name: "Jan",
		lastname: "Nieto",
		email: "jnieto@madridinmobiliaria.pe",
		password: "pmsystem",
		role: "admin",
	},
	{
		id: "3",
		name: "Junior",
		lastname: "Rodrigo",
		email: "jrodrigo@madridinmobiliaria.pe",
		password: "pmsystem",
		role: "admin",
	},
	{
		id: "4",
		name: "Jair",
		lastname: "Quintana",
		email: "jquintana@madridinmobiliaria.pe",
		password: "pmsystem",
		role: "admin",
	},
	{
		id: "5",
		name: "Zeus",
		lastname: "Holguín",
		email: "zholguin@madridinmobiliaria.pe",
		password: "pmsystem",
		role: "viewer",
	},
	{
		id: "6",
		name: "César",
		lastname: "Madrid",
		email: "cmadrid@madridinmobiliaria.pe",
		password: "pmsystem",
		role: "viewer",
	},
];
