import User from "../models/User.js";
import Product from "../models/Product.js";
import { isObjectId } from "../utils/validate.js";

const MAX_QTY = 99;

//update user cartdata : /api/cart/update
export const updateCart = async (req, res) => {
    try {
        const { userId } = req.user; // from the signed cookie, never from req.body
        const incoming = req.body?.cartItems;

        if (!incoming || typeof incoming !== 'object' || Array.isArray(incoming)) {
            return res.status(400).json({ success: false, message: "Invalid cart data" })
        }

        // Keep only valid product ids with whole-number quantities
        const cleaned = {};
        for (const [productId, qty] of Object.entries(incoming)) {
            const quantity = Number(qty);
            if (isObjectId(productId) && Number.isInteger(quantity) && quantity > 0) {
                cleaned[productId] = Math.min(quantity, MAX_QTY);
            }
        }

        // Drop products that no longer exist
        const ids = Object.keys(cleaned);
        if (ids.length > 0) {
            const existing = await Product.find({ _id: { $in: ids } }).select('_id').lean();
            const existingIds = new Set(existing.map((p) => String(p._id)));
            for (const id of ids) {
                if (!existingIds.has(id)) delete cleaned[id];
            }
        }

        await User.findByIdAndUpdate(userId, { cartItems: cleaned })
        res.json({ success: true, message: "Cart Updated" })

    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: "Failed to update cart" })
    }
}
