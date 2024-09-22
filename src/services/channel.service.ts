import mongoose from 'mongoose';
import Channel from '../models/channel.model';

class ChannelService {
	async create(admin: string, name: string, members: string[]) {
		const channel = await Channel.create({
			admin,
			name,
			members
		});

		return channel;
	}

	async findAll(userId: mongoose.Types.ObjectId) {
		const channel = await Channel.find({
			$or: [{ admin: userId }, { members: userId }]
		}).sort({ updatedAt: -1 });

		return channel;
	}
}

export const channelService = new ChannelService();
