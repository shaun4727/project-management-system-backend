import fs from 'fs';
import multer from 'multer';
import path from 'path';

// Ensure the uploads directory exists
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
	fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, uploadDir);
	},
	filename: (req, file, cb) => {
		// Create a unique filename: timestamp + random number + original extension
		const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
		const ext = path.extname(file.originalname);
		cb(null, file.fieldname + '-' + uniqueSuffix + ext);
	},
});

// Optional: Filter for specific file types (e.g., only images and PDFs)
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
	const allowedMimeTypes = ['image/jpeg', 'image/png', 'application/pdf'];
	if (allowedMimeTypes.includes(file.mimetype)) {
		cb(null, true);
	} else {
		cb(new Error('Invalid file type. Only JPEG, PNG, and PDF are allowed.'));
	}
};

export const upload = multer({
	storage,
	fileFilter,
	limits: { fileSize: 5 * 1024 * 1024 }, // Limit files to 5MB
});
