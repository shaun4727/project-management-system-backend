import nodemailer from 'nodemailer';

export const sendEmail = async (to: string, subject: string, html: string) => {
	try {
		const transporter = nodemailer.createTransport({
			service: 'gmail',
			auth: {
				type: 'OAuth2', // Explicitly tell Nodemailer to use OAuth2
				user: process.env.EMAIL_USER,
				clientId: process.env.GOOGLE_CLIENT_ID,
				clientSecret: process.env.GOOGLE_CLIENT_SECRET,
				refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
			},
		});

		await transporter.sendMail({
			from: `"MPMS Admin" <${process.env.EMAIL_USER}>`,
			to,
			subject,
			html,
		});

		console.log(`Email successfully sent to ${to}`);
	} catch (error) {
		console.error('Failed to send email via OAuth2:', error);
		// We log the error but do not throw it, so an email failure
		// doesn't crash the actual task creation process!
	}
};
