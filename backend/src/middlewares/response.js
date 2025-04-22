const responseMiddleware = (req, res, next) => {
	res.success = (data, message, resultsCount) => {
		// console.log(`Success in ${req.method} ---- URL: ${req.url} ---- Data: ${JSON.stringify(data)}`);
		const responsePayload = {
			success: true,
			data: data,
		};

		if (message) responsePayload.message = message;

		if (Array.isArray(data)) {
			responsePayload.resultsCount = resultsCount || data.length;
		} else if (resultsCount !== undefined) {
			responsePayload.resultsCount = resultsCount;
		}

		res.status(200).json(responsePayload);
	};

	res.error = (error, statusCode = 500) => {
		console.log(`Error in ${req.method} ---- URL: ${req.url} ---- Error: ${error}`);
		res.status(statusCode).json({
			success: false,
			error: error.message || error,
		});
	};

	next();
};

export default responseMiddleware;
