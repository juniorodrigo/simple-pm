import app from './app.js';
import config from './config/index.js';

const server = app.listen(config.port, () => {
	console.log(`Servidor corriendo en el puerto ${config.port}`);
	console.log(`Entorno: ${config.nodeEnv}`);
});

// Manejo de señales para cerrar limpiamente
process.on('SIGINT', () => {
	console.log('Cerrando servidor...');
	server.close(() => {
		console.log('Servidor cerrado');
		process.exit(0);
	});
});
