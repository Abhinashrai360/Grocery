import express from 'express';
import authUser from '../middlewares/authUser.js';
import authSeller from '../middlewares/authSeller.js';
import { getAllOrders, getOrderConfig, getUserOrders, placeOrderCOD, placeOrderRazorpay, verifyRazorpayPayment } from '../controllers/orderController.js';

const orderRouter = express.Router();

orderRouter.get('/config', getOrderConfig);
orderRouter.post('/cod', authUser, placeOrderCOD);
orderRouter.post('/razorpay', authUser, placeOrderRazorpay);
orderRouter.post('/razorpay/verify', authUser, verifyRazorpayPayment);
orderRouter.get('/user', authUser, getUserOrders);
orderRouter.post('/user', authUser, getUserOrders); // kept for backward compatibility
orderRouter.get('/seller', authSeller, getAllOrders);
orderRouter.post('/seller', authSeller, getAllOrders); // kept for backward compatibility

export default orderRouter;
