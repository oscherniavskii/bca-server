import express from 'express';
import { contactsController } from '../controllers/contacts.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

export const contactsRouter = express.Router();

contactsRouter.post(
	'/search',
	authMiddleware,
	contactsController.searchContacts
);
contactsRouter.get(
	'/get-contacts-for-dm',
	authMiddleware,
	contactsController.getContactsForDMList
);
contactsRouter.get(
	'/get-all-contacts',
	authMiddleware,
	contactsController.getAllContacts
);
