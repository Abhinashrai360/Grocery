import mongoose from "mongoose";

export const ORDER_STATUSES = ['Order Placed', 'Packed', 'Out for Delivery', 'Delivered', 'Cancelled'];

const orderSchema = new mongoose.Schema({
    userId: { type: String, required: true, ref: 'user' },
    items: [{
        product: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'product' },
        quantity: { type: Number, required: true, min: 1 },
        // Snapshot at purchase time: later price/name changes must not rewrite order history
        name: { type: String, required: true },
        price: { type: Number, required: true },
        image: { type: String, default: '' },
    }],
    subtotal: { type: Number, required: true, default: 0 },
    tax: { type: Number, required: true, default: 0 },
    amount: { type: Number, required: true },
    address: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Address' },
    status: { type: String, enum: ORDER_STATUSES, default: 'Order Placed' },
    paymentMethod: { type: String, enum: ['COD', 'Online'], required: true },
    isPaid: { type: Boolean, required: true, default: false },
    razorpayOrderId: { type: String, index: true, sparse: true },
    razorpayPaymentId: { type: String },
}, { timestamps: true })

orderSchema.index({ userId: 1, createdAt: -1 });

const Order = mongoose.models.order || mongoose.model('order', orderSchema)

export default Order;
