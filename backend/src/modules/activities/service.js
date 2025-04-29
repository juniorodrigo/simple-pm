import prisma from '../../services/prisma.service.js';

const getActivities = async () => {};

const createActivity = async (stageId, activityData) => {
	console.log('activityData', activityData);

	const data = await prisma.projectActivity.create({
		data: {
			title: activityData.title,
			description: activityData.description,
			stage: {
				connect: {
					id: stageId,
				},
			},
			status: activityData.status,
			priority: activityData.priority,
			assignedToUser: {
				connect: {
					id: activityData.assignedToUser.id,
				},
			},
			startDate: activityData.startDate,
			endDate: activityData.endDate,
			executedStartDate: activityData.executedStartDate,
			executedEndDate: activityData.executedEndDate,
		},
	});
	return { success: true, data };
};

const updateActivity = async (activityId, activityData) => {
	console.log('activityData', activityData);

	const data = await prisma.projectActivity.update({
		where: {
			id: activityId,
		},
		data: {
			title: activityData.title,
			description: activityData.description,
			status: activityData.status,
			priority: activityData.priority,
			assignedToUser: {
				connect: {
					id: activityData.assignedToUser.id,
				},
			},
			startDate: activityData.startDate,
			endDate: activityData.endDate,
			executedStartDate: activityData.executedStartDate,
			executedEndDate: activityData.executedEndDate,
		},
	});

	return { success: true, data };
};

const deleteActivity = async (activityId) => {
	const data = await prisma.projectActivity.delete({
		where: {
			id: activityId,
		},
	});
	return { success: true, data };
};

const changeStatus = async (activityId, newStatus) => {
	// console.log(newStatus, 'THIS IS THE NEW STATUS');
	const data = await prisma.projectActivity.update({
		where: {
			id: activityId,
		},
		data: {
			status: newStatus,
		},
	});

	// console.log('data', data);

	return { success: true, data };
};

export const Service = {
	getActivities,
	createActivity,
	updateActivity,
	deleteActivity,
	changeStatus,
};
