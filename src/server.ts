import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import mongoose from 'mongoose';
import { authRouter } from './routes/auth.router';
import { channelRouter } from './routes/channel.router';
import { contactsRouter } from './routes/contacts.router';
import { messagesRouter } from './routes/messages.router';
import setupSocket from './socket';

dotenv.config();

const PORT = process.env.PORT || 5000;
const DB_URL = process.env.DB_URL;

const app = express();

app.use(
	cors({
		origin: [process.env.CLIENT_URL!],
		methods: ['POST', 'GET', 'PUT', 'PATCH', 'DELETE'],
		credentials: true
	})
);
app.use('/uploads/profiles', express.static('uploads/profiles'));
app.use('/uploads/files', express.static('uploads/files'));

app.use(cookieParser());
app.use(helmet());
app.use(compression());
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/contacts', contactsRouter);
app.use('/api/messages', messagesRouter);
app.use('/api/channels', channelRouter);

const server = app.listen(PORT, () =>
	console.log(`Server start on port ${PORT}`)
);

setupSocket(server);

mongoose
	.connect(DB_URL!)
	.then(() => console.log('DB connect successfull'))
	.catch(error => console.log(error.message));
