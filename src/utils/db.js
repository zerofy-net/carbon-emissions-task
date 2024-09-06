import mongoose from "mongoose";

export async function checkMongoDBConnection() {
    try {
        const state = mongoose.connection.readyState;
        if (state === 1) {
            return "MongoDB is connected";
        } else {
            return "MongoDB connection failed";
        }
    } catch (error) {
        return "MongoDB connection failed";
    }
}
