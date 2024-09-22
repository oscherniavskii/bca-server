import express from 'express';
import multer from 'multer';
import { authController } from '../controllers/auth.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const uploads = multer({
	dest: 'uploads/profiles'
});

export const authRouter = express.Router();

authRouter.post('/signup', authController.signup);
authRouter.post('/login', authController.login);
authRouter.post('/logout', authController.logout);
authRouter.get('/user', authMiddleware, authController.getUserProfile);
authRouter.post(
	'/update-profile',
	authMiddleware,
	authController.updateProfile
);
authRouter.post(
	'/add-profile-image',
	authMiddleware,
	uploads.single('profile-image'),
	authController.updateProfileImage
);
authRouter.delete(
	'/remove-profile-image',
	authMiddleware,
	authController.removeProfileImage
);
