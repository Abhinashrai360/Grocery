// Tiny in-memory rate limiter (per IP). Good enough for a single server instance;
// use a shared store (e.g. Redis) if you scale to multiple instances.
const rateLimit = ({ windowMs = 15 * 60 * 1000, max = 20, message = 'Too many requests, please try again later.' } = {}) => {
    const hits = new Map();

    setInterval(() => {
        const now = Date.now();
        for (const [key, entry] of hits) {
            if (entry.reset <= now) hits.delete(key);
        }
    }, windowMs).unref();

    return (req, res, next) => {
        const now = Date.now();
        let entry = hits.get(req.ip);

        if (!entry || entry.reset <= now) {
            entry = { count: 0, reset: now + windowMs };
            hits.set(req.ip, entry);
        }

        entry.count += 1;

        if (entry.count > max) {
            res.set('Retry-After', String(Math.ceil((entry.reset - now) / 1000)));
            return res.status(429).json({ success: false, message });
        }
        next();
    };
};

export default rateLimit;
