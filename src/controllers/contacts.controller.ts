import { NextFunction, Response } from 'express';
import { CustomRequest } from '../middlewares/auth.middleware';
import { messagesService } from '../services/messages.service';
import { userService } from '../services/user.service';
import { getRegex } from '../utils/regex.utils';

class ContactsController {
	async searchContacts(req: CustomRequest, res: Response, next: NextFunction) {
		try {
			const userId = req.userId as string;
			if (!userId) return res.status(401).send('Unathorized');

			const { searchTerm } = req.body;

			if (!searchTerm) {
				return res.status(400).send('Search Term is required');
			}

			const regex = getRegex(searchTerm);

			const contacts = await userService.searchUsers(userId, regex);

			return res.status(200).json(contacts);
		} catch (error) {
			console.log(error);
			return res.status(500).send(`Internal Server Error: ${error}`);
		}
	}

	async getContactsForDMList(
		req: CustomRequest,
		res: Response,
		next: NextFunction
	) {
		try {
			const userId = req.userId as string;
			if (!userId) return res.status(401).send('Unathorized');

			const currentUser = await userService.findById(userId as string);
			if (!currentUser) return res.status(404).send('User not found');

			const contacts = await messagesService.getContactsFromMessages(userId);

			return res.status(200).json(contacts);
		} catch (error) {
			console.log(error);
			return res.status(500).send(`Internal Server Error: ${error}`);
		}
	}

	async getAllContacts(req: CustomRequest, res: Response, next: NextFunction) {
		try {
			const userId = req.userId as string;
			if (!userId) return res.status(401).send('Unathorized');

			const users = await userService.getAllUsers(userId);

			const contacts = users.map(user => ({
				label:
					user.firstName && user.lastName
						? `${user.firstName} ${user.lastName}`
						: user.email,
				value: user._id
			}));

			return res.status(200).json(contacts);
		} catch (error) {
			console.log(error);
			return res.status(500).send(`Internal Server Error: ${error}`);
		}
	}
}

export const contactsController = new ContactsController();
