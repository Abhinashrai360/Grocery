import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { authCookieOptions, clearCookieOptions } from '../utils/cookies.js';

// Constant-time comparison so response time does not leak how much of the password matched
const safeEqual = (a, b) => {
    const hashA = crypto.createHash('sha256').update(String(a)).digest();
    const hashB = crypto.createHash('sha256').update(String(b)).digest();
    return crypto.timingSafeEqual(hashA, hashB);
};

//seller login : /api/seller/login
export const sellerLogin = async (req, res) => {
    try {
        const { email, password } = req.body || {};

        if (!process.env.SELLER_EMAIL || !process.env.SELLER_PASSWORD) {
            return res.status(500).json({ success: false, message: 'Seller account is not configured' });
        }

        if (typeof email === 'string' && typeof password === 'string'
            && safeEqual(email, process.env.SELLER_EMAIL) && safeEqual(password, process.env.SELLER_PASSWORD)) {
            const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '7d' });
            res.cookie('sellerToken', token, authCookieOptions());
            return res.json({ success: true, message: "Logged In as seller" });
        }

        return res.json({ success: false, message: "Invalid Credentials" });

    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}

// check seller auth : /api/seller/is-auth
export const isSellerAuth = async (req, res) => {
    return res.json({ success: true });
};

//Logout Seller : /api/seller/logout
export const sellerLogout = async (req, res) => {
    try {
        res.clearCookie('sellerToken', clearCookieOptions());
        return res.json({ success: true, message: "Logged Out Successfully" })

    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}
