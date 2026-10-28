import express from 'express';
import { register, login, isAuth, logout } from '../controllers/UserController.js'
import authUser from '../middlewares/authUser.js'
import rateLimit from '../middlewares/rateLimit.js';

const userRouter = express.Router();

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: 'Too many attempts, please try again in a few minutes.' });

userRouter.post('/register', authLimiter, register);
userRouter.post('/login', authLimiter, login);
userRouter.get('/is-auth', authUser, isAuth)
userRouter.post('/logout', logout) // no auth needed: clearing a cookie is always safe

export default userRouter;
