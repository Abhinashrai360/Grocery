import Subscriber from '../models/Subscriber.js';
import { EMAIL_REGEX, str } from '../utils/validate.js';

//subscribe : /api/newsletter/subscribe
export const subscribe = async (req, res) => {
    try {
        const email = str(req.body?.email).toLowerCase();
        if (!EMAIL_REGEX.test(email) || email.length > 120) {
            return res.status(400).json({ success: false, message: 'Please enter a valid email' });
        }
        // upsert: subscribing twice is harmless and does not reveal who is already subscribed
        await Subscriber.updateOne({ email }, { $setOnInsert: { email } }, { upsert: true });
        res.json({ success: true, message: 'Thanks for subscribing!' });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, message: 'Failed to subscribe' });
    }
}
