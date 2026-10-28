import express from 'express';
import { subscribe } from '../controllers/newsletterController.js';
import rateLimit from '../middlewares/rateLimit.js';

const newsletterRouter = express.Router();

newsletterRouter.post('/subscribe', rateLimit({ windowMs: 60 * 60 * 1000, max: 10 }), subscribe);

export default newsletterRouter;
