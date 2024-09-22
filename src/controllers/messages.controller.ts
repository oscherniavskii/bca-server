import { NextFunction, Response } from 'express';
import { mkdirSync, renameSync } from 'fs';
import { CustomRequest } from '../middlewares/auth.middleware';
import { messagesService } from '../services/messages.service';
import { userService } from '../services/user.service';

class MessagesController {
	async getMessages(req: CustomRequest, res: Response, next: NextFunction) {
		try {
			const user1Id = req.userId as string;
			if (!user1Id) return res.status(401).send('Unathorized');

			const currentUser = await userService.findById(user1Id as string);
			if (!currentUser) return res.status(404).send('User not found');

			const user2Id = req.body.id;

			if (!user2Id) {
				return res.status(400).send('Users ID is required');
			}

			const messages = await messagesService.getDirectMessages(
				user1Id,
				user2Id
			);

			return res.status(200).json(messages);
		} catch (error) {
			console.log(error);
			return res.status(500).send(`Internal Server Error: ${error}`);
		}
	}

	async uploadFile(req: CustomRequest, res: Response, next: NextFunction) {
		try {
			const user1Id = req.userId as string;
			if (!user1Id) return res.status(401).send('Unathorized');

			const currentUser = await userService.findById(user1Id as string);
			if (!currentUser) return res.status(404).send('User not found');

			if (!req.file) {
				return res.status(400).send('File is required');
			}

			const date = Date.now();
			const fileDir = `uploads/files/${date}`;
			const fileName = `${fileDir}/${req.file.originalname}`;

			mkdirSync(fileDir, { recursive: true });

			renameSync(req.file.path, fileName);

			return res.status(200).json({ filePath: fileName });
		} catch (error) {
			console.log(error);
			return res.status(500).send(`Internal Server Error: ${error}`);
		}
	}
}

export const messagesController = new MessagesController();
