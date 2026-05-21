import { Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import prisma from './prisma'; // Import the configured client instead of creating a new one!

async function seedAdmin() {
	try {
		// 1. Check if an admin already exists
		const adminExists = await prisma.user.findFirst({
			where: {
				role: Role.ADMIN,
			},
		});

		if (adminExists) {
			console.log('⚠️ Admin user already exists. Skipping seed.');
			return;
		}

		// 2. Hash a secure starting password
		const hashedPassword = await bcrypt.hash('supersecure123', 12);

		// 3. Create the initial admin user
		await prisma.user.create({
			data: {
				name: 'System Admin',
				email: 'admin@alien-tech.com',
				password: hashedPassword,
				role: Role.ADMIN,
				department: 'Management',
				skills: ['System Architecture'],
			},
		});

		console.log('✅ Initial Admin user created successfully!');
	} catch (error) {
		console.error('❌ Error seeding admin:', error);
	} finally {
		// The process will naturally exit after execution
		process.exit(0);
	}
}

seedAdmin();
