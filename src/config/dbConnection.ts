import { Db, MongoClient } from "mongodb";

const uri = process.env.MONGO_URI!;
const dbName = process.env.DB_NAME!;

class Database {
  private static db: Db;
  private static client: MongoClient;

  static async connect(): Promise<void> {
    if (this.db) return;
    this.client = new MongoClient(uri);

    await this.client.connect();

    this.db = this.client.db(dbName);

    console.log("Mongodb connected");
  }
  static getDB(): Db {
    if (!this.db) {
      throw new Error("Database not connected. Call Database.connect() first.");
    }

    return this.db;
  }

  static async close(): Promise<void> {
    if (this.client) {
      await this.client.close();
      console.log("Mongodb connection is closed");
    }
  }
}

export default Database;
