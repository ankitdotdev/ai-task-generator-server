"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const response_handler_1 = require("../../../utils/response.handler");
const sepcs_service_1 = __importDefault(require("../service/sepcs.service"));
const errorHandler_1 = __importDefault(require("../../../middleware/errorHandler"));
class SpecsController {
    /**
     * Generates or regenerates engineering specs using AI.
     *
     * Responsibilities:
     * - Validate authenticated user
     * - Extract optional regeneration ID
     * - Delegate business logic to service layer
     * - Return standardized API response
     */
    static async generateSpecs(req, res) {
        try {
            // Extract authenticated user ID (set by auth middleware)
            const userId = req.user?.userId;
            // Optional query parameter for regenerating an existing spec
            const specInputId = req.query.specInputId;
            // Delegate core logic to service layer
            const result = await sepcs_service_1.default.generateSpecsService(userId, req.body, specInputId);
            // Return success response
            return res.status(201).json({
                success: true,
                message: specInputId
                    ? "Specs regenerated successfully"
                    : "Specs generated successfully",
                data: result,
            });
        }
        catch (error) {
            // Handle known application errors
            if (error instanceof errorHandler_1.default) {
                return (0, response_handler_1.sendError)(res, error.statusCode, error.message);
            }
            // Handle unexpected runtime errors
            if (error instanceof Error) {
                return (0, response_handler_1.sendError)(res, 500, error.message);
            }
            // Fallback error response
            return (0, response_handler_1.sendError)(res, 500, "Internal Server Error: Failed to generate specs response");
        }
    }
    static async getSpecsList(req, res) {
        try {
            const userId = req.user?.userId;
            const data = await sepcs_service_1.default.getSpecsListService(userId);
            return (0, response_handler_1.sendSuccess)(res, 200, "Data retrieved successfully", data);
        }
        catch (error) {
            // Handle known errors thrown within the application
            if (error instanceof errorHandler_1.default) {
                return (0, response_handler_1.sendError)(res, error.statusCode, error.message);
            }
            else if (error instanceof Error) {
                // Handle unexpected errors
                return (0, response_handler_1.sendError)(res, 500, "Internal Server Error");
            }
            else {
                // Handle unknown errors
                return (0, response_handler_1.sendError)(res, 500, "Internal Server Error");
            }
        }
    }
    static async updateSpecs(req, res) {
        try {
            const userId = req.user?.userId;
            const specId = req.params.id;
            if (!specId) {
                return (0, response_handler_1.sendError)(res, 400, "Spec id missing");
            }
            await sepcs_service_1.default.updateSpecs(userId, specId, req.body);
            return (0, response_handler_1.sendSuccess)(res, 200, "Specs Updated Succesfully");
        }
        catch (error) {
            // Handle known errors thrown within the application
            if (error instanceof errorHandler_1.default) {
                return (0, response_handler_1.sendError)(res, error.statusCode, error.message);
            }
            else if (error instanceof Error) {
                // Handle unexpected errors
                return (0, response_handler_1.sendError)(res, 500, "Internal Server Error");
            }
            else {
                // Handle unknown errors
                return (0, response_handler_1.sendError)(res, 500, "Internal Server Error");
            }
        }
    }
    static async getSpecsOutputData(req, res) {
        try {
            const userId = req.user?.userId;
            const specId = req.params.id;
            if (!specId) {
                return (0, response_handler_1.sendError)(res, 400, "Spec id is missing");
            }
            const data = await sepcs_service_1.default.getSpecsOutputData(userId, specId);
            return (0, response_handler_1.sendSuccess)(res, 200, "Data retrieved successfully", data);
        }
        catch (error) {
            // Handle known errors thrown within the application
            if (error instanceof errorHandler_1.default) {
                return (0, response_handler_1.sendError)(res, error.statusCode, error.message);
            }
            else if (error instanceof Error) {
                // Handle unexpected errors
                return (0, response_handler_1.sendError)(res, 500, "Internal Server Error");
            }
            else {
                // Handle unknown errors
                return (0, response_handler_1.sendError)(res, 500, "Internal Server Error");
            }
        }
    }
    static async deleteSpecs(req, res) {
        try {
            const userId = req.user?.userId;
            const specId = req.params.id;
            if (!specId) {
                return (0, response_handler_1.sendError)(res, 400, "Spec id missing");
            }
            await sepcs_service_1.default.deleteSpecs(userId, specId);
            return (0, response_handler_1.sendSuccess)(res, 200, "Task Deleted Succesfully");
        }
        catch (error) {
            // Handle known errors thrown within the application
            if (error instanceof errorHandler_1.default) {
                return (0, response_handler_1.sendError)(res, error.statusCode, error.message);
            }
            else if (error instanceof Error) {
                // Handle unexpected errors
                return (0, response_handler_1.sendError)(res, 500, "Internal Server Error");
            }
            else {
                // Handle unknown errors
                return (0, response_handler_1.sendError)(res, 500, "Internal Server Error");
            }
        }
    }
}
exports.default = SpecsController;
