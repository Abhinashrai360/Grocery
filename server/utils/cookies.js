// Cookie options shared by user + seller auth. Read env lazily so dotenv is always loaded first.
const isProd = () => process.env.NODE_ENV === 'production';

export const clearCookieOptions = () => ({
    httpOnly: true, // JS cannot read the cookie (XSS protection)
    secure: isProd(), // HTTPS only in production
    sameSite: isProd() ? 'none' : 'strict',
});

export const authCookieOptions = () => ({
    ...clearCookieOptions(),
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
});
