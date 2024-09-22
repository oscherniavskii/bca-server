import jwt from 'jsonwebtoken';

interface TokenPayload {
	userId: string;
	email: string;
}

class TokenService {
	createToken(email: string, userId: string): string {
		return jwt.sign({ email, userId }, process.env.JWT_KEY!, {
			expiresIn: process.env.TOKEN_TIME
		});
	}

	verifyToken(token: string): TokenPayload {
		return jwt.verify(token, process.env.JWT_KEY!) as TokenPayload;
	}
}

export const tokenService = new TokenService();
