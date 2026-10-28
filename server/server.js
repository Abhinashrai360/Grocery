import 'dotenv/config';
import cookieParser from 'cookie-parser';
import express from 'express';
import cors from 'cors';
import connectDB from './configs/db.js';
import connectCloudinary from './configs/cloudinary.js';
import userRouter from './routes/userRoute.js';
import sellerRouter from './routes/sellerRoute.js';
import productRouter from './routes/productRoute.js';
import cartRouter from './routes/cartRoute.js';
import addressRouter from './routes/addressRoute.js';
import orderRouter from './routes/orderRoute.js';
import newsletterRouter from './routes/newsletterRoute.js';
import { razorpayWebhooks } from './controllers/orderController.js';

const app = express();
const port = process.env.PORT || 5000;

await connectDB();
await connectCloudinary();

// Allow these frontend origins (comma separated in CLIENT_URL), e.g. http://localhost:5173,https://your-app.vercel.app
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim().replace(/\/$/, ''))
    .filter(Boolean);

app.disable('x-powered-by');
app.set('trust proxy', 1); // correct client IP behind Render / Railway / Vercel proxies (rate limiting)

// Basic security headers
app.use((req, res, next) => {
    res.set({
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Cross-Origin-Resource-Policy': 'same-site',
    });
    next();
});

// Razorpay needs the RAW body to verify the signature, so this must come BEFORE express.json()
app.post('/api/order/razorpay-webhook', express.raw({ type: 'application/json' }), razorpayWebhooks);

//Middleware configuration
app.use(express.json({ limit: '100kb' }));
app.use(cookieParser());
app.use(cors({ origin: allowedOrigins, credentials: true }));

app.get('/', (req, res) => res.send('Api is Working'));
app.use('/api/user', userRouter);
app.use('/api/seller', sellerRouter);
app.use('/api/product', productRouter)
app.use('/api/cart', cartRouter)
app.use('/api/address', addressRouter)
app.use('/api/order', orderRouter)
app.use('/api/newsletter', newsletterRouter)

// Unknown API route
app.use('/api', (req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

// Central error handler (multer errors, bad JSON, anything unexpected)
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    const isUploadError = err?.name === 'MulterError' || /image/i.test(err?.message || '');
    const status = err?.type === 'entity.parse.failed' || isUploadError ? 400 : err?.status || 500;
    if (status === 500) console.error(err);
    res.status(status).json({
        success: false,
        message: status === 500 ? 'Internal Server Error' : err.message,
    });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
})
