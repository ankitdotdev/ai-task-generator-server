import ThrowError from "../../../middleware/errorHandler";
import {
  bcryptCompareHashPassword,
  bcryptHashPassword,
} from "../../../utils/bcryprt.handler";
import { jwtToken } from "../../../utils/jwt.handler";
import AuthRepository from "../repository/auth.repository";

class AuthService {
  // Handles business logic for user registration
  static async registerService(email: string, password: string) {
    // Basic validation to prevent empty payload
    if (!email || !password) {
      throw new ThrowError(400, "All fields are required");
    }

    // Check if user already exists in DB
    const isExist = await AuthRepository.userExistanceCheck(email);

    if (isExist) {
      throw new ThrowError(409, "User already exists");
    }

    // Hash password before storing (never store plain text passwords)
    const hashPassword = await bcryptHashPassword(password);

    if (!hashPassword) {
      throw new ThrowError(
        500,
        "Internal Server Error : Failed to hash password",
      );
    }

    // Persist new user into database
    const isRegistered = await AuthRepository.registerUser(email, hashPassword);

    if (!isRegistered) {
      throw new ThrowError(500, "Failed to register!");
    }

    return;
  }

  // Handles authentication + token generation
  static async loginService(email: string, password: string): Promise<string> {
    // Validate input
    if (!email || !password) {
      throw new ThrowError(400, "All fields are required");
    }

    // Fetch user credentials by email
    const user = await AuthRepository.getUserAuthByEmail(email);

    if (!user) {
      throw new ThrowError(404, "User not found");
    }

    // Compare incoming password with stored hashed password
    const isAuthenticated = await bcryptCompareHashPassword(
      password,
      user.password,
    );

    if (!isAuthenticated) {
      throw new ThrowError(401, "Invalid Credentials");
    }

    // Generate JWT token for authenticated session
    const token = await jwtToken({ userId: user._id });

    if (!token) {
      throw new ThrowError(
        500,
        "Internal Server Error : Failed to create token",
      );
    }

    return token;
  }
}

export default AuthService;
