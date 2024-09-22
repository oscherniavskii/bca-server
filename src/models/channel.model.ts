import mongoose from 'mongoose';

const channelSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true
	},
	members: [{ type: mongoose.Types.ObjectId, ref: 'User', required: true }],
	admin: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
	messages: [
		{ type: mongoose.Types.ObjectId, ref: 'Message', required: false }
	],
	createdAt: {
		type: Date,
		default: Date.now
	},
	updatedAt: {
		type: Date,
		default: Date.now
	}
});

channelSchema.pre('save', function (next) {
	this.updatedAt = new Date();
	next();
});

channelSchema.pre('findOneAndUpdate', function (next) {
	this.set({ updatedAt: Date.now() });
	next();
});

const Channel = mongoose.model('Channel', channelSchema);

export default Channel;
