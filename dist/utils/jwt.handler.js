"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.jwtToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const errorHandler_1 = __importDefault(require("../middleware/errorHandler"));
// Generates a JWT token for authenticated users
const jwtToken = async (payload) => {
    // Ensure JWT secret key is configured in environment variables
    if (!process.env.JWT_SECRET_KEY) {
        throw new errorHandler_1.default(500, "Internal Server Error : Missing JWT Secret Key");
    }
    // Sign and return token with 2-hour expiration
    return jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET_KEY, { expiresIn: "2h" });
};
exports.jwtToken = jwtToken;
