import prisma from '../../services/prisma.service.js';

const getStages = async (projectId) => {
	const stages = await prisma.projectStage.findMany({ where: { projectId } });

	return { success: true, data: stages };
};

const createStage = async (projectId, stageData) => {
	const previousStage = await prisma.projectStage.findFirst({
		where: { projectId },
		orderBy: { ordinalNumber: 'desc' },
	});

	const ordinalNumber = previousStage ? previousStage.ordinalNumber + 1 : 1;

	const stage = await prisma.projectStage.create({
		data: {
			...stageData,
			projectId,
			ordinalNumber,
		},
	});

	return { success: true, data: stage };
};

const updateStage = async (stageId, stageData) => {
	console.log(stageData);

	const stage = await prisma.projectStage.update({
		where: { id: stageId },
		data: {
			name: stageData.name,
			description: stageData.description,
			color: stageData.color,
			status: stageData.status,
		},
	});

	return { success: true, data: stage };
};

const deleteStage = async (stageId) => {
	const stage = await prisma.projectStage.delete({
		where: { id: stageId },
	});

	return { success: true, data: stage };
};

const toggleStage = async (stageId, toggleBehavior) => {
	if (toggleBehavior !== 'up' && toggleBehavior !== 'down')
		throw new Error('Invalid toggle behavior. Use "up" or "down".');
	const stageX = await prisma.projectStage.findUnique({
		where: { id: stageId },
		select: { ordinalNumber: true },
	});

	const currentOrdinalNumber = stageX.ordinalNumber;
	const newOrdinalNumber = toggleBehavior == 'up' ? currentOrdinalNumber + 1 : currentOrdinalNumber - 1;

	console.log('currentOrdinalNumber', currentOrdinalNumber, ' / newOrdinalNumber', newOrdinalNumber);

	const stageY = await prisma.projectStage.findFirst({
		where: { ordinalNumber: newOrdinalNumber },
		select: { id: true },
	});

	if (!stageY)
		throw new Error(
			'No stage found with the new ordinal number. This may be due the stage is the last or the first one.'
		);

	const updatedStageY = await prisma.projectStage.update({
		where: { id: stageY.id },
		data: { ordinalNumber: currentOrdinalNumber },
	});

	console.log(updatedStageY, '___________');

	const stage = await prisma.projectStage.update({
		where: { id: stageId },
		data: { ordinalNumber: newOrdinalNumber },
	});

	console.log(stage, '___________');

	return { success: true, data: stage };
};

export const Service = {
	getStages,
	createStage,
	updateStage,
	deleteStage,
	toggleStage,
};
