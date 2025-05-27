export const errorHandler = (err, req, res, next) => {
	if (res.headersSent) return next(err);

	// Si es un AppError “operacional”, devolvemos su mensaje y status
	if (err.isOperational) {
		return res.status(err.statusCode).json({
			success: false,
			message: err.message,
		});
	}

	// Si es un error inesperado, lo logueamos y devolvemos genérico
	console.error('Unexpected Error:', err);
	return res.status(500).json({
		success: false,
		message: 'Ha ocurrido un error interno. Intenta más tarde.',
	});
};
