import prisma from '../../services/prisma.service.js';

const getTags = async () => {
	let users = await prisma.projectCategory.findMany({});

	return { success: true, data: users };
};

const createTag = async (tag) => {
	const { name, color } = tag;

	const existingTag = await prisma.projectCategory.findFirst({
		where: {
			name,
		},
	});

	if (existingTag) throw new Error('Ya existe un tag con ese nombre');

	const newTag = await prisma.projectCategory.create({
		data: {
			name,
			color,
		},
	});

	return { success: true, data: newTag };
};

const updateTag = async (id, tag) => {
	const { name, color } = tag;

	const updatedTag = await prisma.projectCategory.update({
		where: { id },
		data: {
			name,
			color,
		},
	});

	return { success: true, data: updatedTag };
};

const deleteTag = async (id) => {
	const deletedTag = await prisma.projectCategory.delete({
		where: { id },
	});

	return { success: true, data: deletedTag };
};

export const Service = {
	getTags,
	createTag,
	updateTag,
	deleteTag,
};
