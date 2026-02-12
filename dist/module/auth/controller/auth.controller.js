"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const response_handler_1 = require("../../../utils/response.handler");
const auth_service_1 = __importDefault(require("../service/auth.service"));
const errorHandler_1 = __importDefault(require("../../../middleware/errorHandler"));
class AuthController {
    // Handles user registration request
    static async registerUser(req, res) {
        try {
            // Extract user credentials from request body
            const { email, password } = req.body;
            // Call service layer to create user
            await auth_service_1.default.registerService(email, password);
            // Send standardized success response
            return (0, response_handler_1.sendSuccess)(res, 201, "Registered Successfully!");
        }
        catch (error) {
            // Handle known application errors
            if (error instanceof errorHandler_1.default) {
                return (0, response_handler_1.sendError)(res, error.statusCode, error.message);
            }
            // Handle unexpected runtime errors
            else if (error instanceof Error) {
                return (0, response_handler_1.sendError)(res, 500, error.message);
            }
            // Fallback for unknown error types
            else {
                return (0, response_handler_1.sendError)(res, 500, "Internal Server Error : Failed to register user");
            }
        }
    }
    // Handles user login request and returns authentication token
    static async loginUser(req, res) {
        try {
            // Extract login credentials
            const { email, password } = req.body;
            // Validate credentials and generate JWT token
            const token = await auth_service_1.default.loginService(email, password);
            // Send token in standardized response
            return (0, response_handler_1.sendSuccess)(res, 200, "Loning Successfull!", token);
        }
        catch (error) {
            // Handle business-level errors (invalid credentials, etc.)
            if (error instanceof errorHandler_1.default) {
                return (0, response_handler_1.sendError)(res, error.statusCode, error.message);
            }
            // Handle unexpected failures
            else if (error instanceof Error) {
                return (0, response_handler_1.sendError)(res, 500, error.message);
            }
            // Fallback safeguard
            else {
                return (0, response_handler_1.sendError)(res, 500, "Internal Server Error : Failed to register user");
            }
        }
    }
}
exports.default = AuthController;
