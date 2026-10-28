import Address from '../models/Address.js';
import { PHONE_REGEX, ZIP_REGEX, str } from '../utils/validate.js';

//add address : /api/address/add
export const addAddress = async (req, res) => {
    try {
        const { userId } = req.user; // from the signed cookie, never from req.body
        const input = req.body?.address || {};

        // Whitelist + trim every field
        const address = {
            firstName: str(input.firstName),
            lastName: str(input.lastName),
            street: str(input.street),
            city: str(input.city),
            state: str(input.state),
            zipCode: str(input.zipCode),
            country: str(input.country),
            phone: str(input.phone),
        };

        for (const [field, value] of Object.entries(address)) {
            if (!value) {
                return res.status(400).json({ success: false, message: `Please fill in all address fields (${field} is missing)` });
            }
            if (value.length > 120) {
                return res.status(400).json({ success: false, message: `${field} is too long` });
            }
        }
        if (!PHONE_REGEX.test(address.phone)) {
            return res.status(400).json({ success: false, message: 'Please enter a valid phone number' });
        }
        if (!ZIP_REGEX.test(address.zipCode)) {
            return res.status(400).json({ success: false, message: 'Please enter a valid zip / pin code' });
        }

        await Address.create({ ...address, userId })
        res.json({ success: true, message: "Address added successfully" })
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Failed to add address" });
    }
}

//get address : /api/address/get
export const getAddress = async (req, res) => {
    try {
        const { userId } = req.user;
        const addresses = await Address.find({ userId }).sort({ createdAt: -1 }).lean();
        res.json({ success: true, addresses });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Failed to get addresses" });
    }
}
