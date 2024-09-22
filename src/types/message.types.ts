import mongoose from 'mongoose';

export interface IMessage {
	sender: mongoose.Types.ObjectId;
	recipient?: mongoose.Types.ObjectId;
	messageType: 'text' | 'file';
	content?: string;
	fileUrl?: string;
	channelId?: string;
}
