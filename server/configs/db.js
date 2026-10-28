import mongoose from "mongoose";

const connectDB = async () => {
    try {
        mongoose.connection.on('connected', () => {
            console.log("MongoDB connected successfully")
        })
        const uri = (process.env.MONGODB_URI || '').replace(/\/$/, '');
        await mongoose.connect(`${uri}/greencart`)
    } catch (error) {
        // Without a database the API is useless, so fail fast instead of running half-broken
        console.error('MongoDB connection failed:', error.message);
        process.exit(1);
    }
}
export default connectDB;
