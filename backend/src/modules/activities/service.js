import { ActivityStatus } from '@prisma/client';
import prisma from '../../services/prisma.service.js';

const getActivities = async () => {};

const createActivity = async (stageId, activityData) => {
	// console.log('activityData', activityData);

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

	await updateProjectStatusByActivityId(data.id);
	return { success: true, data };
};

const updateActivity = async (activityId, activityData) => {
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

	await updateProjectStatusByActivityId(activityId);

	return { success: true, data };
};

const deleteActivity = async (activityId) => {
	const data = await prisma.projectActivity.delete({
		where: {
			id: activityId,
		},
	});

	await updateProjectStatusByActivityId(activityId);

	return { success: true, data };
};

const changeStatus = async (activityId, newStatus) => {
	const newDates = {};
	if (newStatus === ActivityStatus.pending) {
		newDates.executedStartDate = null;
	}
	if (newStatus === ActivityStatus.review) {
		newDates.executedEndDate = null;
	}

	const data = await prisma.projectActivity.update({
		where: {
			id: activityId,
		},
		data: {
			status: newStatus,
			...newDates,
		},
	});

	await updateProjectStatusByActivityId(activityId);

	return { success: true, data };
};

export const Service = {
	getActivities,
	createActivity,
	updateActivity,
	deleteActivity,
	changeStatus,
};

const updateProjectStatusByActivityId = async (activityId) => {
	const payload = await prisma.projectActivity.findFirst({
		where: {
			id: activityId,
		},
		select: {
			stage: {
				select: {
					projectId: true,
				},
			},
		},
	});

	const projectId = payload.stage.projectId;

	const stages = await prisma.projectStage.findMany({
		where: {
			projectId: parseInt(projectId),
		},
		include: {
			ProjectActivity: true,
		},
	});

	const totalActivities = stages.reduce((acc, stage) => acc + stage.ProjectActivity.length, 0);
	const completedActivities = stages.reduce(
		(acc, stage) =>
			acc + stage.ProjectActivity.filter((activity) => activity.status === ActivityStatus.completed).length,
		0
	);
	const inProgressActivities = stages.reduce(
		(acc, stage) =>
			acc +
			stage.ProjectActivity.filter(
				(activity) => activity.status === ActivityStatus.in_progress || ActivityStatus.review
			).length,
		0
	);

	const updatedData = {};

	console.log(`Completed activities: ${completedActivities}`);
	console.log(`Total activities: ${totalActivities}`);

	if (completedActivities === totalActivities && totalActivities > 0) {
		updatedData.newStatus = 'review';
		updatedData.realEndDate = new Date();
	} else if (totalActivities > completedActivities && inProgressActivities > 0) {
		updatedData.newStatus = 'in_progress';
		updatedData.realEndDate = null;
		updatedData.realStartDate = new Date();
	} else {
		updatedData.newStatus = 'pending';
	}

	console.log('________________Updating project status to:', updatedData);

	await prisma.project.update({
		where: { id: parseInt(projectId) },
		data: updatedData,
	});
};
