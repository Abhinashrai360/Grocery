// One-time migration: old products stored `category` as an array, the app now uses a plain string.
// Run once:  npm run migrate:category
import 'dotenv/config';
import mongoose from 'mongoose';

const uri = (process.env.MONGODB_URI || '').replace(/\/$/, '');
await mongoose.connect(`${uri}/greencart`);

const products = mongoose.connection.collection('products');
const result = await products.updateMany(
    { category: { $type: 'array' } },
    [{ $set: { category: { $arrayElemAt: ['$category', 0] } } }]
);
// the old schema had an unused cartItems field on products
await products.updateMany({ cartItems: { $exists: true } }, { $unset: { cartItems: '' } });

console.log(`Migrated ${result.modifiedCount} product(s).`);
await mongoose.disconnect();
