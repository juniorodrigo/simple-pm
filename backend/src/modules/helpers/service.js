import { AppError } from '#middlewares/errors';
import prisma from '#services/prisma.service';

async function getSelect(type) {
	let data = {};

	switch (type) {
		case 'areas':
			data = await prisma.area.findMany({
				select: {
					id: true,
					name: true,
				},
				where: {
					isActive: true,
				},
			});

			break;

		default:
			throw new AppError('Invalid type specified for areas retrieval');
	}

	return { data: data, message: 'Select items retrieved successfully' };
}

export const HelpersService = { getSelect };
