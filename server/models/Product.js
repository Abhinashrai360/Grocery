import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    description: { type: Array, required: true },
    price: { type: Number, required: true, min: 0 },
    offerPrice: { type: Number, required: true, min: 0 },
    image: { type: Array, required: true },
    category: { type: String, required: true, trim: true },
    inStock: { type: Boolean, default: true },
    // Filled by the reviews feature; the UI only shows stars when numReviews > 0
    rating: { type: Number, default: 0, min: 0, max: 5 },
    numReviews: { type: Number, default: 0, min: 0 },
}, {
    timestamps: true
});

productSchema.index({ category: 1 });
productSchema.index({ createdAt: -1 });

const Product = mongoose.models.product || mongoose.model('product', productSchema);

export default Product;
