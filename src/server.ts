// src/server.ts
import dotenv from 'dotenv';
import type { Server } from 'http';
import app from './app';
import prisma from './app/utils/prisma';

dotenv.config();

const PORT = process.env.PORT || 5000;
let server: Server;

async function bootstrap() {
	try {
		// Optionally test the Prisma connection before starting the server
		await prisma.$connect();
		console.log('🛢️  Database connected successfully via Prisma');

		server = app.listen(PORT, () => {
			console.log(`🚀 Server is running on port ${PORT}`);
		});
	} catch (error) {
		console.error('Failed to connect to the database:', error);
		process.exit(1);
	}
}

bootstrap();

// Graceful shutdown handlers
process.on('unhandledRejection', (err) => {
	console.log(`😈 unhandledRejection is detected, shutting down...`);
	if (server) {
		server.close(() => {
			process.exit(1);
		});
	} else {
		process.exit(1);
	}
});

process.on('uncaughtException', () => {
	console.log(`😈 uncaughtException is detected, shutting down...`);
	process.exit(1);
});
