import { NextFunction, Response } from 'express';
import mongoose from 'mongoose';
import { CustomRequest } from '../middlewares/auth.middleware';
import Channel from '../models/channel.model';
import { channelService } from '../services/channel.service';
import { userService } from '../services/user.service';

class ChannelController {
	async createChannel(req: CustomRequest, res: Response, next: NextFunction) {
		try {
			const userId = req.userId as string;
			if (!userId) return res.status(401).send('Unathorized');

			const { name, members } = req.body;

			const admin = await userService.findById(userId);
			if (!admin) return res.status(400).send('Admin user not found');

			const validMembers = await userService.findArrayById(members);
			if (validMembers.length !== members.length)
				return res.status(400).send('Some members are not valid users');

			const newChannel = await channelService.create(userId, name, members);

			return res.status(201).json(newChannel);
		} catch (error) {
			console.log(error);
			return res.status(500).send(`Internal Server Error: ${error}`);
		}
	}

	async getAllChannel(req: CustomRequest, res: Response, next: NextFunction) {
		try {
			const userId = req.userId as string;
			if (!userId) return res.status(401).send('Unathorized');

			const id = new mongoose.Types.ObjectId(userId);

			const channels = await channelService.findAll(id);

			return res.status(201).json(channels);
		} catch (error) {
			console.log(error);
			return res.status(500).send(`Internal Server Error: ${error}`);
		}
	}

	async getChannelMessages(
		req: CustomRequest,
		res: Response,
		next: NextFunction
	) {
		try {
			const userId = req.userId as string;
			if (!userId) return res.status(401).send('Unathorized');

			const { channelId } = req.body;

			const channel = await Channel.findById(channelId).populate({
				path: 'messages',
				populate: {
					path: 'sender',
					select: 'firstName lastName email _id image color'
				}
			});

			if (!channel) return res.status(404).send('Channel not found.');

			const messages = channel.messages;

			return res.status(201).json(messages);
		} catch (error) {
			console.log(error);
			return res.status(500).send(`Internal Server Error: ${error}`);
		}
	}
}

export const channelController = new ChannelController();
