import express from 'express';
import multer from 'multer';
import { messagesController } from '../controllers/messages.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

export const messagesRouter = express.Router();
const upload = multer({ dest: 'uploads/files' });

messagesRouter.post(
	'/get-direct-messages',
	authMiddleware,
	messagesController.getMessages
);
messagesRouter.post(
	'/upload-file',
	authMiddleware,
	upload.single('msg-file'),
	messagesController.uploadFile
);
