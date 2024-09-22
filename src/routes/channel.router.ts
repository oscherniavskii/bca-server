import express from 'express';
import { channelController } from '../controllers/channel.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

export const channelRouter = express.Router();

channelRouter.post('/create', authMiddleware, channelController.createChannel);
channelRouter.get('/get-all', authMiddleware, channelController.getAllChannel);
channelRouter.post(
	'/get-messages',
	authMiddleware,
	channelController.getChannelMessages
);
