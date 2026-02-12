"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Custom application error class used to carry HTTP status codes with errors
class ThrowError extends Error {
    constructor(statusCode, message) {
        super(message); // Pass message to the base Error class
        this.statusCode = statusCode; // Attach HTTP status code for API responses
        // Restore prototype chain (required when extending built-in classes in TS/JS)
        Object.setPrototypeOf(this, ThrowError.prototype);
        // Capture clean stack trace excluding this constructor
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.default = ThrowError;
