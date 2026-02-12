import { ObjectId } from "mongodb";

// Type definition representing a User document stored in MongoDB
export interface UserTypes {
  _id?: ObjectId;      // MongoDB-generated unique identifier (optional when creating a new user)
  email: string;       // User's unique email address (should have a DB unique index)
  password: string;    // Hashed password (never store plain text)
  createdAt: Date;     // Timestamp when the user was created
}
