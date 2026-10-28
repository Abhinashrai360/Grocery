import crypto from "crypto";
import Razorpay from "razorpay";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Address from "../models/Address.js";
import User from "../models/User.js";
import { isObjectId } from "../utils/validate.js";

const MAX_QTY = 99;
const MAX_LINE_ITEMS = 50;

const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

const getTaxPercent = () => {
    const tax = Number(process.env.TAX_PERCENT);
    return Number.isFinite(tax) && tax >= 0 && tax <= 50 ? tax : 2;
};

const razorpayConfigured = () => Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);

let razorpayClient;
const getRazorpay = () => razorpayClient || (razorpayClient = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
}));

const getCurrency = () => (process.env.RAZORPAY_CURRENCY || 'INR').toUpperCase();

// constant-time comparison of two hex signatures
const safeEqual = (a = '', b = '') => {
    const x = Buffer.from(String(a));
    const y = Buffer.from(String(b));
    return x.length === y.length && crypto.timingSafeEqual(x, y);
};
const hmac = (secret, payload) => crypto.createHmac('sha256', secret).update(payload).digest('hex');

// mark an online order as paid (idempotent) and empty the user's saved cart
const markOrderPaid = async (filter, paymentId) => {
    const order = await Order.findOneAndUpdate(
        { ...filter, paymentMethod: 'Online' },
        { isPaid: true, ...(paymentId ? { razorpayPaymentId: paymentId } : {}) },
        { returnDocument: 'after' }
    );
    if (order) await User.findByIdAndUpdate(order.userId, { cartItems: {} });
    return order;
};

/**
 * Builds a trusted order from the cart. EVERYTHING that affects money comes from the database:
 * prices, availability, tax. The client only tells us WHICH products, HOW MANY, and WHICH address.
 */
const prepareOrder = async (userId, items, addressId) => {
    if (!Array.isArray(items) || items.length === 0 || items.length > MAX_LINE_ITEMS) {
        return { error: 'Your cart is empty' };
    }
    if (!isObjectId(addressId)) {
        return { error: 'Please select a delivery address' };
    }

    // merge duplicates + validate quantities
    const wanted = new Map();
    for (const item of items) {
        const productId = item?.product;
        const quantity = Number(item?.quantity);
        if (!isObjectId(productId) || !Number.isInteger(quantity) || quantity < 1) {
            return { error: 'Invalid item in cart' };
        }
        wanted.set(productId, Math.min((wanted.get(productId) || 0) + quantity, MAX_QTY));
    }

    // address must belong to the logged-in user
    const address = await Address.findOne({ _id: addressId, userId }).lean();
    if (!address) {
        return { error: 'Invalid delivery address' };
    }

    const products = await Product.find({ _id: { $in: [...wanted.keys()] } }).lean();
    const byId = new Map(products.map((p) => [String(p._id), p]));

    const orderItems = [];
    let subtotal = 0;
    for (const [productId, quantity] of wanted) {
        const product = byId.get(productId);
        if (!product) return { error: 'Some products are no longer available' };
        if (!product.inStock) return { error: `${product.name} is out of stock` };

        orderItems.push({
            product: product._id,
            quantity,
            name: product.name,
            price: product.offerPrice,
            image: product.image?.[0] || '',
        });
        subtotal += product.offerPrice * quantity;
    }

    subtotal = round2(subtotal);
    const tax = round2((subtotal * getTaxPercent()) / 100);
    return { orderItems, subtotal, tax, amount: round2(subtotal + tax) };
};

//public checkout settings : GET /api/order/config
export const getOrderConfig = (req, res) => {
    res.json({ success: true, taxPercent: getTaxPercent(), onlinePayment: razorpayConfigured() });
};

//place order COD : /api/order/cod
export const placeOrderCOD = async (req, res) => {
    try {
        const { userId } = req.user; // from the signed cookie
        const { items, address } = req.body || {};

        const prepared = await prepareOrder(userId, items, address);
        if (prepared.error) {
            return res.json({ success: false, message: prepared.error });
        }

        await Order.create({
            userId,
            items: prepared.orderItems,
            subtotal: prepared.subtotal,
            tax: prepared.tax,
            amount: prepared.amount,
            address,
            paymentMethod: "COD",
        });
        await User.findByIdAndUpdate(userId, { cartItems: {} });

        return res.json({ success: true, message: "Order placed successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Failed to place order" });
    }
}

//place order with Razorpay : /api/order/razorpay  -> creates a Razorpay order for the Checkout popup
export const placeOrderRazorpay = async (req, res) => {
    let order;
    try {
        if (!razorpayConfigured()) {
            return res.json({ success: false, message: "Online payment is not available right now" });
        }

        const { userId } = req.user;
        const { items, address } = req.body || {};

        const prepared = await prepareOrder(userId, items, address);
        if (prepared.error) {
            return res.json({ success: false, message: prepared.error });
        }

        // tidy up this user's abandoned (never paid) online orders older than 1 hour
        await Order.deleteMany({
            userId, paymentMethod: 'Online', isPaid: false,
            createdAt: { $lt: new Date(Date.now() - 60 * 60 * 1000) },
        }).catch(() => { });

        order = await Order.create({
            userId,
            items: prepared.orderItems,
            subtotal: prepared.subtotal,
            tax: prepared.tax,
            amount: prepared.amount,
            address,
            paymentMethod: "Online",
        });

        const currency = getCurrency();
        const rpOrder = await getRazorpay().orders.create({
            amount: Math.round(prepared.amount * 100), // smallest unit (paise)
            currency,
            receipt: order._id.toString(),
            notes: { orderId: order._id.toString(), userId },
        });

        order.razorpayOrderId = rpOrder.id;
        await order.save();

        return res.json({
            success: true,
            keyId: process.env.RAZORPAY_KEY_ID,
            razorpayOrderId: rpOrder.id,
            amount: rpOrder.amount,
            currency: rpOrder.currency,
        });
    } catch (error) {
        console.error(error?.error?.description || error.message);
        // do not leave an unpaid order behind if the payment could not be started
        if (order) await Order.deleteOne({ _id: order._id, isPaid: false }).catch(() => { });
        res.status(500).json({ success: false, message: "Failed to start online payment" });
    }
}

//verify payment after the Checkout popup succeeds : POST /api/order/razorpay/verify
export const verifyRazorpayPayment = async (req, res) => {
    try {
        if (!razorpayConfigured()) {
            return res.json({ success: false, message: "Online payment is not available right now" });
        }
        const { userId } = req.user;
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {};
        if (![razorpay_order_id, razorpay_payment_id, razorpay_signature].every((v) => typeof v === 'string' && v)) {
            return res.json({ success: false, message: "Invalid payment details" });
        }

        const expected = hmac(process.env.RAZORPAY_KEY_SECRET, `${razorpay_order_id}|${razorpay_payment_id}`);
        if (!safeEqual(expected, razorpay_signature)) {
            return res.status(400).json({ success: false, message: "Payment verification failed" });
        }

        const order = await markOrderPaid({ razorpayOrderId: razorpay_order_id, userId }, razorpay_payment_id);
        if (!order) {
            return res.json({ success: false, message: "Order not found" });
        }
        return res.json({ success: true, message: "Payment successful, order placed" });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, message: "Could not verify payment" });
    }
}

//Razorpay webhook : POST /api/order/razorpay-webhook (raw body, registered BEFORE express.json in server.js)
// safety net in case the browser closes before /razorpay/verify is called
export const razorpayWebhooks = async (req, res) => {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) return res.status(503).send('Razorpay webhook is not configured');

    const signature = req.headers['x-razorpay-signature'];
    if (!Buffer.isBuffer(req.body) || !safeEqual(hmac(secret, req.body), signature)) {
        console.error('Razorpay webhook signature check failed');
        return res.status(400).send('Webhook Error');
    }

    try {
        const event = JSON.parse(req.body.toString('utf8'));
        if (event.event === 'payment.captured' || event.event === 'order.paid') {
            const payment = event.payload?.payment?.entity;
            const razorpayOrderId = payment?.order_id || event.payload?.order?.entity?.id;
            if (razorpayOrderId) await markOrderPaid({ razorpayOrderId }, payment?.id);
        }
        res.json({ received: true });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false });
    }
}

// orders that count: COD, or online orders that were really paid
const VISIBLE_ORDERS = [{ paymentMethod: "COD" }, { isPaid: true }];

//get orders of the logged-in user : /api/order/user
export const getUserOrders = async (req, res) => {
    try {
        const { userId } = req.user; // from the signed cookie, never from req.body
        const orders = await Order.find({ userId, $or: VISIBLE_ORDERS })
            .populate("items.product", "category")
            .populate("address")
            .sort({ createdAt: -1 })
            .lean();
        res.json({ success: true, orders });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, message: "Failed to load orders" });
    }
}

//get all orders (seller) : /api/order/seller
export const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find({ $or: VISIBLE_ORDERS })
            .populate("address")
            .sort({ createdAt: -1 })
            .limit(500)
            .lean();
        res.json({ success: true, orders });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, message: "Failed to load orders" });
    }
}
