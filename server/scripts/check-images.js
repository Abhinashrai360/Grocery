// Read-only diagnostic: shows what is stored in each product's `image` field.  Run:  node scripts/check-images.js
// (prints no secrets, changes nothing)
import 'dotenv/config';
import mongoose from 'mongoose';

const uri = (process.env.MONGODB_URI || '').replace(/\/$/, '');
await mongoose.connect(`${uri}/greencart`);
const products = await mongoose.connection.collection('products').find({}).toArray();

const kind = (value) => {
    if (typeof value === 'string' && /^https?:\/\//i.test(value)) return 'URL (ok)';
    if (typeof value === 'string') return 'FILE NAME / LOCAL PATH';
    if (value && typeof value === 'object') return 'OBJECT (old upload bug)';
    return 'EMPTY / INVALID';
};

const counts = {};
for (const p of products) {
    const k = kind(Array.isArray(p.image) ? p.image[0] : undefined);
    counts[k] = (counts[k] || 0) + 1;
}

console.log(`\n${products.length} products in database\n`);
console.table(counts);
console.log('\nFirst 5 examples:');
for (const p of products.slice(0, 5)) {
    const first = Array.isArray(p.image) ? p.image[0] : p.image;
    const shown = typeof first === 'string' ? first.slice(0, 80) : JSON.stringify(first)?.slice(0, 80);
    console.log(`- ${p.name}: ${kind(first)}  ->  ${shown}`);
}
console.log('\nURL (ok)               = nothing to fix');
console.log('FILE NAME / LOCAL PATH = works with the new client; run seed-products.js to move them to Cloudinary for production');
console.log('OBJECT / EMPTY         = run: node scripts/seed-products.js');
await mongoose.disconnect();
