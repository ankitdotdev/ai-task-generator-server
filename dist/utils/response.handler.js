"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendError = exports.sendSuccess = void 0;
// Sends a consistent success response structure across the API
const sendSuccess = (res, statusCode, message, data) => {
    // Base response object (kept explicit for type safety and clarity)
    const response = {
        success: true,
        message,
    };
    // Add data only when provided to avoid sending empty fields
    if (data !== undefined) {
        response.data = data;
    }
    // Return formatted HTTP response
    return res.status(statusCode).json(response);
};
exports.sendSuccess = sendSuccess;
// Standardized error response formatter to maintain consistent API shape
const sendError = (res, statusCode, message) => {
    return res.status(statusCode).json({
        success: false,
        message,
    });
};
exports.sendError = sendError;
