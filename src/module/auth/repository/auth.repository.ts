import Database from "../../../config/dbConnection";

class AuthRepository {
  // Checks whether a user with the given email already exists
  static async userExistanceCheck(email: string): Promise<boolean> {
    const db = Database.getDB();
    const usersCollection = db.collection("users");

    // Only fetch _id to keep query lightweight (existence check optimization)
    const user = await usersCollection.findOne(
      { email },
      { projection: { _id: 1 } },
    );

    return Boolean(user);
  }

  // Fetches authentication-related fields required during login
  static async getUserAuthByEmail(
    email: string,
  ): Promise<{ _id: string; password: string } | null> {
    const db = Database.getDB();
    const usersCollection = db.collection("users");

    // Retrieve only fields needed for authentication (avoid over-fetching)
    const user = await usersCollection.findOne(
      { email },
      { projection: { _id: 1, password: 1 } },
    );

    if (!user) return null;

    // Normalize Mongo ObjectId to string for service layer usage
    return {
      _id: user._id.toString(),
      password: user.password,
    };
  }

  // Inserts a new user record into the database
  static async registerUser(email: string, password: string): Promise<boolean> {
    const db = Database.getDB();
    const usersCollection = db.collection("users");

    const { acknowledged } = await usersCollection.insertOne({
      email,
      password, // Already hashed before reaching repository
      createdAt: new Date(),
    });

    // acknowledged === true means insert was successful
    return acknowledged;
  }
}

export default AuthRepository;
