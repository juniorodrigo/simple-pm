import { HelpersService } from './service.js';
import { NotFoundError } from '#middlewares/errors';

// This controller handles area management operations such as retrieving, creating, updating, and deleting areas.
export const getSelect = async (req, res) => {
	const { type } = req.params;

	const { data, message } = await HelpersService.getSelect(type);
	if (!data) throw new NotFoundError('No se reconoce el grupo solicitado');

	res.success(data, message);
};
