import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        // Set mongoose options
        mongoose.set('strictQuery', false);

        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
            socketTimeoutMS: 45000,
        });

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        console.log(`📁 Database: ${conn.connection.name}`);
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        console.error(`💡 Make sure MongoDB is running on localhost:27017`);
        console.error(`💡 Try running: net start MongoDB`);
        console.error(`💡 Or install MongoDB from: https://www.mongodb.com/try/download/community`);
        // Don't exit - allow server to run without MongoDB for testing
    }
};

export default connectDB;
