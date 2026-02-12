"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
const uri = process.env.MONGO_URI;
const dbName = process.env.DB_NAME;
// Singleton Database manager to ensure only one MongoDB connection is used
class Database {
    // Establishes connection to MongoDB (called once during app startup)
    static async connect() {
        // Prevent multiple connections in case connect() is called again
        if (this.db)
            return;
        this.client = new mongodb_1.MongoClient(uri);
        await this.client.connect();
        this.db = this.client.db(dbName);
        console.log("Mongodb connected");
    }
    // Provides access to the initialized database instance
    static getDB() {
        if (!this.db) {
            throw new Error("Database not connected. Call Database.connect() first.");
        }
        return this.db;
    }
    // Gracefully closes MongoDB connection (used during shutdown / tests)
    static async close() {
        if (this.client) {
            await this.client.close();
            console.log("Mongodb connection is closed");
        }
    }
}
exports.default = Database;
