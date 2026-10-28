import User from "../models/User.js";
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken';
import { authCookieOptions, clearCookieOptions } from '../utils/cookies.js';
import { EMAIL_REGEX, str } from '../utils/validate.js';

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

//Register User : /api/user/register
export const register = async (req, res) => {
    try {
        const name = str(req.body?.name);
        const email = str(req.body?.email).toLowerCase();
        const password = typeof req.body?.password === 'string' ? req.body.password : '';

        if (!name || !email || !password) {
            return res.json({ success: false, message: 'Missing Details' })
        }
        if (name.length < 2 || name.length > 50) {
            return res.json({ success: false, message: 'Name must be 2-50 characters' })
        }
        if (!EMAIL_REGEX.test(email)) {
            return res.json({ success: false, message: 'Please enter a valid email' })
        }
        // bcrypt only uses the first 72 bytes, so cap the length
        if (password.length < 6 || password.length > 72) {
            return res.json({ success: false, message: 'Password must be 6-72 characters' })
        }

        const existingUser = await User.findOne({ email })
        if (existingUser)
            return res.json({ success: false, message: 'User already exists' })

        const hashedPassword = await bcrypt.hash(password, 10)
        const user = await User.create({ name, email, password: hashedPassword })

        res.cookie('token', signToken(user._id), authCookieOptions())
        return res.json({ success: true, user: { email: user.email, name: user.name } })

    } catch (error) {
        console.log(error.message)
        if (error.code === 11000) {
            return res.json({ success: false, message: 'User already exists' })
        }
        res.status(500).json({ success: false, message: 'Internal Server Error' })
    }
}

// Login user : /api/user/login
export const login = async (req, res) => {
    try {
        const email = str(req.body?.email).toLowerCase();
        const password = typeof req.body?.password === 'string' ? req.body.password : '';

        if (!email || !password) {
            return res.json({ success: false, message: 'Email and password are required' });
        }

        const user = await User.findOne({ email });
        // Same message for "no user" and "wrong password" so attackers cannot find registered emails
        if (!user) {
            return res.json({ success: false, message: 'Invalid email or password' })
        }
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch)
            return res.json({ success: false, message: 'Invalid email or password' })

        res.cookie('token', signToken(user._id), authCookieOptions())
        return res.json({ success: true, user: { email: user.email, name: user.name } })

    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}

//check auth : /api/user/is-auth
export const isAuth = async (req, res) => {
    try {
        const { userId } = req.user;

        const user = await User.findById(userId).select("-password");

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        return res.json({ success: true, user });

    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

//logout User : /api/user/logout
export const logout = async (req, res) => {
    try {
        res.clearCookie('token', clearCookieOptions());
        return res.json({ success: true, message: "Logged Out Successfully" })

    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}
