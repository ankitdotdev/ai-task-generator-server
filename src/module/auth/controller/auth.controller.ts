import { Request, Response } from "express";
import { sendError, sendSuccess } from "../../../utils/response.handler";
import AuthService from "../service/auth.service";
import ThrowError from "../../../middleware/errorHandler";

class AuthController {
  // Handles user registration request
  static async registerUser(req: Request, res: Response) {
    try {
      // Extract user credentials from request body
      const { email, password } = req.body;

      // Call service layer to create user
      await AuthService.registerService(email, password);

      // Send standardized success response
      return sendSuccess(res, 201, "Registered Successfully!");
    } catch (error) {
      // Handle known application errors
      if (error instanceof ThrowError) {
        return sendError(res, error.statusCode, error.message);
      }
      // Handle unexpected runtime errors
      else if (error instanceof Error) {
        return sendError(res, 500, error.message);
      }
      // Fallback for unknown error types
      else {
        return sendError(
          res,
          500,
          "Internal Server Error : Failed to register user",
        );
      }
    }
  }

  // Handles user login request and returns authentication token
  static async loginUser(req: Request, res: Response): Promise<any> {
    try {
      // Extract login credentials
      const { email, password } = req.body;

      // Validate credentials and generate JWT token
      const token = await AuthService.loginService(email, password);

      // Send token in standardized response
      return sendSuccess(res, 200, "Loning Successfull!", token);
    } catch (error) {
      // Handle business-level errors (invalid credentials, etc.)
      if (error instanceof ThrowError) {
        return sendError(res, error.statusCode, error.message);
      }
      // Handle unexpected failures
      else if (error instanceof Error) {
        return sendError(res, 500, error.message);
      }
      // Fallback safeguard
      else {
        return sendError(
          res,
          500,
          "Internal Server Error : Failed to register user",
        );
      }
    }
  }
}

export default AuthController;
