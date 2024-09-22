import { compare } from 'bcrypt';
import { NextFunction, Request, Response } from 'express';
import { renameSync, unlinkSync } from 'fs';
import { CustomRequest } from '../middlewares/auth.middleware';
import { tokenService } from '../services/token.service';
import { userService } from '../services/user.service';

class AuthController {
	async signup(req: Request, res: Response, next: NextFunction) {
		try {
			const { email, password } = req.body;

			if (!email || !password) {
				return res.status(400).send('Email and Password is required');
			}

			const user = await userService.create(email, password);

			res.cookie('jwt', tokenService.createToken(email, user.id), {
				maxAge: +process.env.COOKIE_TIME!,
				secure: true,
				sameSite: 'none'
			});

			return res.status(201).json({
				_id: user.id,
				email: user.email,
				profileSetup: user.profileSetup
			});
		} catch (error) {
			console.log(error);
			return res.status(500).send(`Internal Server Error: ${error}`);
		}
	}

	async login(req: Request, res: Response, next: NextFunction) {
		try {
			const { email, password } = req.body;

			if (!email || !password) {
				return res.status(400).send('Email and Password is required');
			}

			const user = await userService.findByEmail(email);

			if (!user) {
				return res.status(404).send('User with this email not found');
			}

			const isAuth = await compare(password, user.password);

			if (!isAuth) {
				return res.status(401).send('Password is incorrect');
			}

			res.cookie('jwt', tokenService.createToken(email, user.id), {
				maxAge: +process.env.COOKIE_TIME!,
				secure: true,
				sameSite: 'none'
			});

			return res.status(200).json({
				_id: user.id,
				email: user.email,
				firstName: user.firstName,
				lastName: user.lastName,
				color: user.color,
				profileSetup: user.profileSetup,
				image: user.image
			});
		} catch (error) {
			console.log(error);
			return res.status(500).send(`Internal Server Error: ${error}`);
		}
	}

	async logout(req: CustomRequest, res: Response, next: NextFunction) {
		try {
			res.cookie('jwt', '', { maxAge: 1, secure: true, sameSite: 'none' });

			return res.status(200).send('Logout succesfull.');
		} catch (error) {
			console.log(error);
			return res.status(500).send(`Internal Server Error: ${error}`);
		}
	}

	async getUserProfile(req: CustomRequest, res: Response, next: NextFunction) {
		try {
			const userId = req.userId;

			if (!userId) return res.status(401).send('Unathorized');

			const user = await userService.findById(userId as string);

			if (!user) return res.status(404).send('User not found');

			return res.status(200).json({
				_id: user.id,
				email: user.email,
				firstName: user.firstName,
				lastName: user.lastName,
				color: user.color,
				profileSetup: user.profileSetup,
				image: user.image
			});
		} catch (error) {
			console.log(error);
			return res.status(500).send(`Internal Server Error: ${error}`);
		}
	}

	async updateProfile(req: CustomRequest, res: Response, next: NextFunction) {
		try {
			const userId = req.userId;
			if (!userId) return res.status(401).send('Unathorized');

			const currentUser = await userService.findById(userId as string);
			if (!currentUser) return res.status(404).send('User not found');

			const { firstName, lastName, color } = req.body;
			if (!firstName || !lastName || color === undefined) {
				return res.status(400).send('FirstName, lastName, color is required');
			}

			const user = await userService.update(
				userId as string,
				firstName,
				lastName,
				color
			);

			if (!user) return res.status(404).send('User not found');

			return res.status(200).json({
				_id: user.id,
				email: user.email,
				firstName: user.firstName,
				lastName: user.lastName,
				color: user.color,
				profileSetup: user.profileSetup,
				image: user.image
			});
		} catch (error) {
			console.log(error);
			return res.status(500).send(`Internal Server Error: ${error}`);
		}
	}

	async updateProfileImage(
		req: CustomRequest,
		res: Response,
		next: NextFunction
	) {
		try {
			const userId = req.userId;
			if (!userId) return res.status(401).send('Unathorized');

			const currentUser = await userService.findById(userId as string);
			if (!currentUser) return res.status(404).send('User not found');

			if (!req.file) {
				return res.status(400).send('File is required');
			}

			const date = Date.now();
			let fileName = 'uploads/profiles/' + date + req.file.originalname;
			renameSync(req.file.path, fileName);

			const user = await userService.updateImage(userId as string, fileName);

			if (!user) return res.status(404).send('User not found');

			return res.status(200).json({
				_id: user.id,
				email: user.email,
				firstName: user.firstName,
				lastName: user.lastName,
				color: user.color,
				profileSetup: user.profileSetup,
				image: user.image
			});
		} catch (error) {
			console.log(error);
			return res.status(500).send(`Internal Server Error: ${error}`);
		}
	}

	async removeProfileImage(
		req: CustomRequest,
		res: Response,
		next: NextFunction
	) {
		try {
			const userId = req.userId;
			if (!userId) return res.status(401).send('Unathorized');

			const currentUser = await userService.findById(userId as string);
			if (!currentUser) return res.status(404).send('User not found');

			if (currentUser.image) {
				unlinkSync(currentUser.image);
			}

			const user = await userService.deleteImage(userId as string);

			if (!user) return res.status(404).send('User not found');

			return res.status(200).json({
				_id: user.id,
				email: user.email,
				firstName: user.firstName,
				lastName: user.lastName,
				color: user.color,
				profileSetup: user.profileSetup,
				image: user.image
			});
		} catch (error) {
			console.log(error);
			return res.status(500).send(`Internal Server Error: ${error}`);
		}
	}
}

export const authController = new AuthController();
