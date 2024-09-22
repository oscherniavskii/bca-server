import { NextFunction, Request, Response } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import { tokenService } from '../services/token.service';

export interface CustomRequest extends Request {
	userId?: JwtPayload | string;
}

export const authMiddleware = (
	req: CustomRequest,
	res: Response,
	next: NextFunction
) => {
	const token = req.cookies.jwt;

	if (!token) return res.status(401).send('You are not authentificated.');

	const payload = tokenService.verifyToken(token);

	if (!payload) return res.status(401).send('Token is not valid.');

	req.userId = payload.userId;

	next();
};
