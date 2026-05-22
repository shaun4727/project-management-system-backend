// src/app.ts
import cors from 'cors';
import express, { type Application, type Request, type Response } from 'express';
import path from 'path';
import globalErrorHandler from './app/errors/globalErrorHandler';
import notFound from './app/middlewares/notFound';
import router from './app/routes';

const app: Application = express();

// 1. Global Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 2. Application Routes
app.use('/api/v1', router);

// 3. Health Check Route
app.get('/', (req: Request, res: Response) => {
	res.status(200).json({
		success: true,
		message: 'Welcome to the MPMS API!',
	});
});

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// 4. Global Error Handler
app.use(globalErrorHandler);

// 5. Not Found Middleware
app.use(notFound);

export default app;
