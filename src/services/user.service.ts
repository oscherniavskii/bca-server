import User from '../models/user.model';

class UserService {
	async create(email: string, password: string) {
		const currentUser = await User.findOne({ email });

		if (currentUser) throw new Error('User allready exist');

		const user = await User.create({ email, password });

		if (!user) throw new Error('User creating error');

		return user;
	}

	async findByEmail(email: string) {
		const user = await User.findOne({ email });

		return user;
	}

	async findById(userId: string) {
		const user = await User.findById(userId);

		return user;
	}

	async update(
		userId: string,
		firstName: string,
		lastName: string,
		color: number
	) {
		const user = await User.findByIdAndUpdate(
			userId,
			{
				firstName,
				lastName,
				color,
				profileSetup: true
			},
			{ new: true, runValidators: true }
		);

		return user;
	}

	async updateImage(userId: string, image: string) {
		const user = await User.findByIdAndUpdate(
			userId,
			{
				image
			},
			{ new: true, runValidators: true }
		);

		return user;
	}

	async deleteImage(userId: string) {
		const user = await User.findByIdAndUpdate(
			userId,
			{
				image: null
			},
			{ new: true, runValidators: true }
		);

		return user;
	}

	async searchUsers(userId: string, regex: RegExp) {
		const users = await User.find({
			$and: [
				{ _id: { $ne: userId } },
				{ $or: [{ firstName: regex }, { lastName: regex }, { email: regex }] }
			]
		})
			.select('-password')
			.exec();

		return users;
	}

	async getAllUsers(userId: string) {
		const users = await User.find(
			{
				_id: {
					$ne: userId
				}
			},
			'firstName lastName _id email'
		);

		return users;
	}

	async findArrayById(userIds: string[]) {
		const users = await User.find({
			_id: { $in: userIds }
		});

		return users;
	}
}

export const userService = new UserService();
