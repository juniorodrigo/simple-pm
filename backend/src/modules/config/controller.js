import { ConfigService } from '#modules/config/service';
import { NotFoundError, ValidationError } from '#middlewares/errors';

export const getAreas = async (req, res) => {
	const { data, message } = await ConfigService.getAreas();
	if (!data) throw new NotFoundError(message);

	res.success(data, message);
};

export const createArea = async (req, res) => {
	const { name } = req.body;
	if (!name) throw new ValidationError('Area name is required');

	const { data, message } = await ConfigService.createArea(name);
	if (!data) throw new NotFoundError(message);

	res.success(data, message);
};
export const updateArea = async (req, res) => {
	const { id } = req.params;
	const { name } = req.body;

	if (!id) throw new ValidationError('Area ID is required');
	if (!name) throw new ValidationError('Area name is required');

	const { data, message } = await ConfigService.updateArea(id, name);
	if (!data) throw new NotFoundError(message);

	res.success(data, message);
};
export const deleteArea = async (req, res) => {
	const { id } = req.params;

	if (!id) throw new ValidationError('Area ID is required');

	const { data, message } = await ConfigService.deleteArea(id);

	res.success(data, message);
};
