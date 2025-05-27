import { AppError } from '#middlewares/errors';
import prisma from '#services/prisma.service';

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

async function updateArea(id, name) {
	const existingArea = await prisma.area.findUnique({
		where: { id: id },
	});
	if (!existingArea) throw new AppError('Área no encontrada');

	const updatedArea = await prisma.area.update({
		where: { id: id },
		data: { name: name },
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

export const ConfigService = { getAreas, createArea, updateArea, deleteArea };
