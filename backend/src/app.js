import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

const app = express();

// Middlewares
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.get('/', (req, res) => {
	res.json({ message: 'API funcionando correctamente' });
});

// Middleware para manejo de errores
app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(500).json({
		status: 'error',
		message: 'Ha ocurrido un error en el servidor',
	});
});

export default app;
