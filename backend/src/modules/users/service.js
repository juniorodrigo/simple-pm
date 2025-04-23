import prisma from '../../services/prisma.service.js';

const getUsers = async () => {
	let users = await prisma.user.findMany({});

	users = users.map((user) => {
		return { ...user, lastActive: new Date() };
	});

	return { success: true, data: users };
};

const createUser = async (userData) => {
	const existUser = await prisma.user.findFirst({
		where: {
			OR: [{ username: userData.username }, { email: userData.email }],
		},
	});

	if (existUser) throw new Error('Ya existe un usuario con ese username o correo');

	const result = await prisma.user.create({
		data: userData,
	});

	return {
		success: true,
		data: result,
	};
};

const updateUser = async (userId, userData) => {
	const { username, name, lastname, email, isActive, role } = userData;

	const result = await prisma.user.update({
		where: {
			id: userId,
		},
		data: { username, name, lastname, email, isActive, role },
	});

	console.log(result);

	return { success: true, data: result };
};

const deleteUser = async (userId) => {
	const existUser = await prisma.projectMember.findFirst({
		where: {
			userId: userId,
		},
	});

	if (existUser) throw new Error('No se puede eliminar el usuario porque tiene pertenece a un proyecto');

	const result = await prisma.user.delete({
		where: {
			id: userId,
		},
	});

	return { success: true };
};

export const Service = {
	getUsers,
	createUser,
	updateUser,
	deleteUser,
};
