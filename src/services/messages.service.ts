import mongoose from 'mongoose';
import Message from '../models/message.model';

class MessagesService {
	async getDirectMessages(user1Id: string, user2Id: string) {
		const messages = await Message.find({
			$or: [
				{ sender: user1Id, recipient: user2Id },
				{ sender: user2Id, recipient: user1Id }
			]
		}).sort({ timestamp: 1 });

		return messages;
	}

	async getContactsFromMessages(id: string) {
		const userId = new mongoose.Types.ObjectId(id);

		const contacts = await Message.aggregate([
			{
				$match: {
					$or: [{ sender: userId }, { recipient: userId }]
				}
			},
			{
				$sort: { timestamp: -1 }
			},
			{
				$group: {
					_id: {
						$cond: {
							if: { $eq: ['$sender', userId] },
							then: '$recipient',
							else: '$sender'
						}
					},
					lastMessageTime: { $first: '$timestamp' }
				}
			},
			{
				$lookup: {
					from: 'users',
					localField: '_id',
					foreignField: '_id',
					as: 'contactInfo'
				}
			},
			{
				$unwind: '$contactInfo'
			},
			{
				$project: {
					_id: 1,
					lastMessageTime: 1,
					email: '$contactInfo.email',
					firstName: '$contactInfo.firstName',
					lastName: '$contactInfo.lastName',
					image: '$contactInfo.image',
					color: '$contactInfo.color',
					profileSetup: '$contactInfo.profileSetup'
				}
			},
			{
				$sort: { lastMessageTime: -1 }
			}
		]);

		return contacts;
	}
}

export const messagesService = new MessagesService();
