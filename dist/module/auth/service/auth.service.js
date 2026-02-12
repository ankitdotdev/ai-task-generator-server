"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const errorHandler_1 = __importDefault(require("../../../middleware/errorHandler"));
const bcryprt_handler_1 = require("../../../utils/bcryprt.handler");
const jwt_handler_1 = require("../../../utils/jwt.handler");
const auth_repository_1 = __importDefault(require("../repository/auth.repository"));
class AuthService {
    // Handles business logic for user registration
    static async registerService(email, password) {
        // Basic validation to prevent empty payload
        if (!email || !password) {
            throw new errorHandler_1.default(400, "All fields are required");
        }
        // Check if user already exists in DB
        const isExist = await auth_repository_1.default.userExistanceCheck(email);
        if (isExist) {
            throw new errorHandler_1.default(409, "User already exists");
        }
        // Hash password before storing (never store plain text passwords)
        const hashPassword = await (0, bcryprt_handler_1.bcryptHashPassword)(password);
        if (!hashPassword) {
            throw new errorHandler_1.default(500, "Internal Server Error : Failed to hash password");
        }
        // Persist new user into database
        const isRegistered = await auth_repository_1.default.registerUser(email, hashPassword);
        if (!isRegistered) {
            throw new errorHandler_1.default(500, "Failed to register!");
        }
        return;
    }
    // Handles authentication + token generation
    static async loginService(email, password) {
        // Validate input
        if (!email || !password) {
            throw new errorHandler_1.default(400, "All fields are required");
        }
        // Fetch user credentials by email
        const user = await auth_repository_1.default.getUserAuthByEmail(email);
        if (!user) {
            throw new errorHandler_1.default(404, "User not found");
        }
        // Compare incoming password with stored hashed password
        const isAuthenticated = await (0, bcryprt_handler_1.bcryptCompareHashPassword)(password, user.password);
        if (!isAuthenticated) {
            throw new errorHandler_1.default(401, "Invalid Credentials");
        }
        // Generate JWT token for authenticated session
        const token = await (0, jwt_handler_1.jwtToken)({ userId: user._id });
        if (!token) {
            throw new errorHandler_1.default(500, "Internal Server Error : Failed to create token");
        }
        return token;
    }
}
exports.default = AuthService;
