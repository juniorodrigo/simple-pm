export class AppError extends Error {
	constructor(message, statusCode = 400) {
		super(message);
		this.statusCode = statusCode;
		this.isOperational = true;
		// Para que se capture bien la pila
		Error.captureStackTrace(this, this.constructor);
	}
}

export class ValidationError extends AppError {
	constructor(message) {
		super(message, 400);
	}
}

export class AuthError extends AppError {
	constructor(message = 'No autorizado') {
		super(message, 401);
	}
}

export class NotFoundError extends AppError {
	constructor(message = 'Recurso no encontrado') {
		super(message, 404);
	}
}
