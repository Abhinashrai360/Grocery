import fs from 'fs/promises';
import { v2 as cloudinary } from "cloudinary"
import Product from "../models/Product.js";
import { CATEGORIES } from '../utils/categories.js';
import { isObjectId, str } from '../utils/validate.js';

// multer stores uploads in the OS temp dir; always remove them once we are done
const removeTempFiles = async (files = []) => {
    await Promise.all(files.map((file) => fs.unlink(file.path).catch(() => { })));
};

//add product : /api/product/add
export const addProduct = async (req, res) => {
    const files = req.files || [];
    try {
        let productData;
        try {
            productData = JSON.parse(req.body.productData);
        } catch {
            return res.status(400).json({ success: false, message: 'Invalid product data' });
        }

        const name = str(productData.name);
        const category = str(productData.category);
        const price = Number(productData.price);
        const offerPrice = Number(productData.offerPrice);
        const description = (Array.isArray(productData.description) ? productData.description : String(productData.description || '').split('\n'))
            .map((line) => str(line))
            .filter(Boolean)
            .slice(0, 10);

        if (name.length < 2 || name.length > 120) {
            return res.status(400).json({ success: false, message: 'Product name must be 2-120 characters' });
        }
        if (!CATEGORIES.includes(category)) {
            return res.status(400).json({ success: false, message: 'Please select a valid category' });
        }
        if (!Number.isFinite(price) || price <= 0 || !Number.isFinite(offerPrice) || offerPrice <= 0) {
            return res.status(400).json({ success: false, message: 'Price and offer price must be greater than 0' });
        }
        if (offerPrice > price) {
            return res.status(400).json({ success: false, message: 'Offer price cannot be higher than the price' });
        }
        if (description.length === 0) {
            return res.status(400).json({ success: false, message: 'Please add a product description' });
        }
        if (files.length < 1 || files.length > 4) {
            return res.status(400).json({ success: false, message: 'Please upload 1 to 4 product images' });
        }

        const imagesUrl = await Promise.all(
            files.map(async (item) => {
                const result = await cloudinary.uploader.upload(item.path, { resource_type: 'image' });
                return result.secure_url
            })
        )

        // Whitelist fields: never spread client data straight into the model
        await Product.create({ name, description, category, price, offerPrice, image: imagesUrl })
        res.json({ success: true, message: "Product added" })
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: 'Failed to add product' })
    } finally {
        await removeTempFiles(files);
    }
}

//get product list : /api/product/list
export const productList = async (req, res) => {
    try {
        const products = await Product.find({}).sort({ createdAt: -1 }).lean()
        res.json({ success: true, products })
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: 'Failed to load products' })
    }
}

//get single product : /api/product/id?id=<productId>
export const productById = async (req, res) => {
    try {
        const id = req.query.id || req.body?.id;
        if (!isObjectId(id)) {
            return res.status(400).json({ success: false, message: 'Invalid product id' })
        }
        const product = await Product.findById(id).lean()
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' })
        }
        res.json({ success: true, product })
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: 'Failed to load product' })
    }
}

//change product inStock : /api/product/stock
export const changeStock = async (req, res) => {
    try {
        const { id, inStock } = req.body || {}
        if (!isObjectId(id) || typeof inStock !== 'boolean') {
            return res.status(400).json({ success: false, message: 'Invalid data' })
        }
        const product = await Product.findByIdAndUpdate(id, { inStock })
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' })
        }
        res.json({ success: true, message: "Stock Updated" })
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: 'Failed to update stock' })
    }
}
