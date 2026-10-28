// Seeds / repairs the sample grocery catalogue (35 products).
//  - uploads the sample images from client/src/assets to YOUR Cloudinary account
//  - creates missing products and FIXES existing ones whose `image` is not a real URL
//
//   npm run seed:products -- --dry-run   (only shows what would happen)
//   npm run seed:products                (repair broken + add missing)
//   npm run seed:products -- --force     (also overwrite products that already have valid images)
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import { CATEGORIES } from '../utils/categories.js';

const dryRun = process.argv.includes('--dry-run');
const force = process.argv.includes('--force');

const here = path.dirname(fileURLToPath(import.meta.url));
const assetsDir = path.resolve(here, '../../client/src/assets');
const products = JSON.parse(fs.readFileSync(path.join(here, 'seed-data/products.json'), 'utf8'));

const isRealUrl = (value) => typeof value === 'string' && /^https?:\/\//i.test(value);
const hasValidImages = (doc) => Array.isArray(doc.image) && doc.image.length > 0 && doc.image.every(isRealUrl);

// sanity check before touching anything
for (const p of products) {
    if (!CATEGORIES.includes(p.category)) throw new Error(`Unknown category "${p.category}" for ${p.name}`);
    for (const file of p.image) {
        if (!fs.existsSync(path.join(assetsDir, file))) throw new Error(`Missing image file: ${path.join(assetsDir, file)}`);
    }
}

if (!dryRun) {
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
        throw new Error('Cloudinary keys are missing in server/.env');
    }
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });
}

const uploaded = new Map(); // file name -> url (each image is uploaded only once)
const upload = async (file) => {
    if (!uploaded.has(file)) {
        // fixed public_id + overwrite: running the script again never creates duplicates
        const result = await cloudinary.uploader.upload(path.join(assetsDir, file), {
            public_id: `greencart/${path.parse(file).name}`,
            overwrite: true,
            resource_type: 'image',
        });
        uploaded.set(file, result.secure_url);
    }
    return uploaded.get(file);
};

const uri = (process.env.MONGODB_URI || '').replace(/\/$/, '');
await mongoose.connect(`${uri}/greencart`);
const collection = mongoose.connection.collection('products');

let created = 0, repaired = 0, skipped = 0;
for (const p of products) {
    const existing = await collection.findOne({ name: p.name });

    if (existing && hasValidImages(existing) && !force) {
        skipped++;
        continue;
    }

    const action = existing ? 'repair' : 'create';
    if (dryRun) {
        console.log(`[dry-run] would ${action}: ${p.name} (${p.image.length} image${p.image.length > 1 ? 's' : ''})`);
        existing ? repaired++ : created++;
        continue;
    }

    const image = [];
    for (const file of p.image) image.push(await upload(file));

    const data = {
        name: p.name,
        category: p.category,
        price: p.price,
        offerPrice: p.offerPrice,
        description: p.description,
        image,
        inStock: p.inStock !== false,
    };

    if (existing) {
        await collection.updateOne({ _id: existing._id }, { $set: data, $unset: { cartItems: '' } });
        repaired++;
    } else {
        const now = new Date();
        await collection.insertOne({ ...data, rating: 0, numReviews: 0, createdAt: now, updatedAt: now });
        created++;
    }
    console.log(`${action === 'repair' ? 'Repaired' : 'Created'}: ${p.name}`);
}

console.log(`\nDone${dryRun ? ' (dry run)' : ''}: ${created} created, ${repaired} repaired, ${skipped} already fine.`);
await mongoose.disconnect();
