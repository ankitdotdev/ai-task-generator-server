import jwt from "jsonwebtoken";
import ThrowError from "../middleware/errorHandler";

// Generates a JWT token for authenticated users
export const jwtToken = async (payload: any) => {
  // Ensure JWT secret key is configured in environment variables
  if (!process.env.JWT_SECRET_KEY) {
    throw new ThrowError(500, "Internal Server Error : Missing JWT Secret Key");
  }

  // Sign and return token with 2-hour expiration
  return jwt.sign(payload, process.env.JWT_SECRET_KEY!, { expiresIn: "2h" });
};
