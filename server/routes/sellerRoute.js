import express from 'express';
import { sellerLogin, isSellerAuth, sellerLogout } from '../controllers/sellerController.js';
import authSeller from '../middlewares/authSeller.js'
import rateLimit from '../middlewares/rateLimit.js';

const sellerRouter = express.Router();

const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: 'Too many attempts, please try again in a few minutes.' });

sellerRouter.post('/login', loginLimiter, sellerLogin);
sellerRouter.get('/is-auth', authSeller, isSellerAuth);
sellerRouter.get('/logout', sellerLogout);

export default sellerRouter;
