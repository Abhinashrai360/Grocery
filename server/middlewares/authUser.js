import jwt from 'jsonwebtoken';

// Sets req.user.userId from the signed cookie. Controllers must ALWAYS use req.user.userId,
// never a userId coming from req.body.
const authUser = async (req, res, next) => {
    const { token } = req.cookies || {};

    if (!token) return res.status(401).json({ success: false, message: 'Not Authorized' });

    try {
        const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);

        if (!tokenDecode.id) return res.status(401).json({ success: false, message: 'Not Authorized' });

        req.user = { userId: tokenDecode.id };
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Not Authorized' });
    }
};

export default authUser;
