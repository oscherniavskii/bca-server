import { type Server } from 'http';
import { type Socket, Server as SoketIOServer } from 'socket.io';
import Channel from './models/channel.model';
import Message from './models/message.model';
import { IMessage } from './types/message.types';

const setupSocket = (server: Server) => {
	const io = new SoketIOServer(server, {
		cors: {
			origin: process.env.CLIENT_URL,
			methods: ['POST', 'GET', 'PUT', 'PATCH', 'DELETE'],
			credentials: true
		}
	});

	const userSocketMap = new Map();

	const disconnect = (socket: Socket) => {
		console.log(`User disconnected: ${socket.id} `);

		for (const [userId, socketId] of userSocketMap.entries()) {
			if (socketId === socket.id) {
				userSocketMap.delete(userId);
				break;
			}
		}
	};

	const sendMessage = async (message: IMessage) => {
		const senderSocketId = userSocketMap.get(message.sender);
		const recipientSocketId = userSocketMap.get(message.recipient);

		const createdMessage = await Message.create(message);

		const messageData = await Message.findById(createdMessage._id)
			.populate('sender', 'id email firstName lastName image color')
			.populate('recipient', 'id email firstName lastName image color');

		if (recipientSocketId) {
			io.to(recipientSocketId).emit('recieveMessage', messageData);
		}

		if (senderSocketId) {
			io.to(senderSocketId).emit('recieveMessage', messageData);
		}
	};

	const sendChannelMessage = async (message: IMessage) => {
		const { sender, content, messageType, fileUrl, channelId } = message;

		const createdMessage = await Message.create({
			sender,
			recipient: null,
			content,
			messageType,
			fileUrl,
			timestamp: new Date()
		});

		const messageData = await Message.findById(createdMessage._id)
			.populate('sender', 'id email firstName lastName image color')
			.exec();

		const channel = await Channel.findByIdAndUpdate(
			channelId,
			{
				$push: { messages: createdMessage._id }
			},
			{ new: true }
		).populate('members');

		const finalData = { ...messageData?.toObject(), channelId: channel?._id };

		if (channel && channel.members) {
			channel.members.forEach(member => {
				const memberSocketId = userSocketMap.get(member._id.toString());
				if (memberSocketId) {
					io.to(memberSocketId).emit('recieveChannelMessage', finalData);
				}
			});

			if (channel.admin) {
				const adminSocketId = userSocketMap.get(channel.admin.toString());
				if (adminSocketId) {
					io.to(adminSocketId).emit('recieveChannelMessage', finalData);
				}
			}
		}
	};

	io.on('connection', socket => {
		const userId = socket.handshake.query.userId;

		if (userId) {
			userSocketMap.set(userId, socket.id);
			console.log(`User connected: ${userId} with socket ID: ${socket.id}`);
		} else {
			console.log('User ID not found.');
		}

		socket.on('sendMessage', sendMessage);
		socket.on('sendChannelMessage', sendChannelMessage);

		socket.on('disconnect', () => disconnect(socket));
	});
};

export default setupSocket;
