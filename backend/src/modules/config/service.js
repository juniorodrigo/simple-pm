import { AppError } from '#middlewares/errors';
import prisma from '#services/prisma.service';
import bcrypt from 'bcrypt';

async function getAreas() {
	const areas = await prisma.area.findMany();

	console.log(areas);

	return { data: areas, message: 'Areas retrieved successfully' };
}
async function createArea(name) {
	const existingArea = await prisma.area.findFirst({
		where: {
			name: name,
		},
	});
	if (existingArea) throw new AppError('Area already exists');

	const newArea = await prisma.area.create({
		data: {
			name: name,
		},
		select: {
			id: true,
			name: true,
			isActive: true,
		},
	});

	return { data: newArea, message: 'Area created successfully' };
}
async function updateArea(id, name, isActive) {
	const existingArea = await prisma.area.findUnique({
		where: { id: id },
	});
	if (!existingArea) throw new AppError('Área no encontrada');

	const updatedArea = await prisma.area.update({
		where: { id: id },
		data: { name: name, isActive: isActive },
		select: {
			id: true,
			name: true,
			isActive: true,
		},
	});

	return { data: updatedArea, message: 'Area updated successfully' };
}
async function deleteArea(id) {
	const existingArea = await prisma.area.findUnique({
		where: { id: id },
	});
	if (!existingArea) throw new AppError('Área no encontrada');

	await prisma.area.delete({
		where: { id: id },
	});

	return { data: null, message: 'Area deleted successfully' };
}
export const AreasService = { getAreas, createArea, updateArea, deleteArea };

async function getUsers() {
	const users = await prisma.user.findMany({
		select: {
			id: true,
			email: true,
			name: true,
			lastname: true,
			area: {
				select: {
					id: true,
					name: true,
				},
			},
			role: true,
			isActive: true,
		},
	});

	if (!users) throw new AppError('No users found');

	return { data: users, message: 'Users retrieved successfully' };
}
async function createUser(data) {
	const existingUser = await prisma.user.findFirst({
		where: {
			email: data.email,
		},
	});
	if (existingUser) throw new AppError('User already exists');

	const newUser = await prisma.user.create({
		data,
		select: {
			id: true,
			name: true,
			lastname: true,
			email: true,
			isActive: true,
			role: true,
			area: {
				select: {
					id: true,
					name: true,
				},
			},
		},
	});

	return { data: newUser, message: 'User created successfully' };
}
async function updateUser(id, name, lastname, email, areaId, role, isActive) {
	const existingUser = await prisma.user.findUnique({
		where: { id: id },
	});
	if (!existingUser) throw new AppError('User not found');

	const updatedUser = await prisma.user.update({
		where: { id: id },
		data: { name: name, email: email, isActive: isActive, lastname },
		select: {
			id: true,
			name: true,
			email: true,
			isActive: true,
		},
	});

	return { data: updatedUser, message: 'User updated successfully' };
}
async function deleteUser(id) {
	const existingUser = await prisma.user.findUnique({
		where: { id: id },
	});
	if (!existingUser) throw new AppError('User not found');

	await prisma.user.delete({
		where: { id: id },
	});

	return { data: null, message: 'User deleted successfully' };
}
export const UserService = { getUsers, createUser, updateUser, deleteUser };

async function login(email, password) {
	if (!email || !password) throw new AppError('Email and password are required');

	const user = await prisma.user.findUnique({
		where: { email: email },
		select: {
			id: true,
			name: true,
			lastname: true,
			email: true,
			password: true,
			role: true,
			isActive: true,
			area: {
				select: {
					id: true,
					name: true,
				},
			},
		},
	});

	if (!user) throw new AppError('User not found');

	const isPasswordValid = await bcrypt.compare(password, user.password);
	if (!isPasswordValid) throw new AppError('Invalid password');

	return { data: user, message: 'Login successful' };
}
export const AuthService = { login };
