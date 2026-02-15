import { Request, Response } from "express";
import { sendError, sendSuccess } from "../../../utils/response.handler";
import SpecsService from "../service/sepcs.service";
import ThrowError from "../../../middleware/errorHandler";

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
  static async generateSpecs(req: Request, res: Response): Promise<any> {
    try {
      // Extract authenticated user ID (set by auth middleware)
      const userId = req.user?.userId as string;

      // Optional query parameter for regenerating an existing spec
      const specInputId = req.query.specInputId as string | undefined;

      // Delegate core logic to service layer
      const result = await SpecsService.generateSpecsService(
        userId,
        req.body,
        specInputId,
      );

      // Return success response
      return res.status(201).json({
        success: true,
        message: specInputId
          ? "Specs regenerated successfully"
          : "Specs generated successfully",
        data: result,
      });
    } catch (error) {
      // Handle known application errors
      if (error instanceof ThrowError) {
        return sendError(res, error.statusCode, error.message);
      }

      // Handle unexpected runtime errors
      if (error instanceof Error) {
        return sendError(res, 500, error.message);
      }

      // Fallback error response
      return sendError(
        res,
        500,
        "Internal Server Error: Failed to generate specs response",
      );
    }
  }

  static async getSpecsList(req: Request, res: Response): Promise<any> {
    try {
      const userId = req.user?.userId as string;
      const data = await SpecsService.getSpecsListService(userId);

      return sendSuccess(res, 200, "Data retrieved successfully", data);
    } catch (error) {
      // Handle known errors thrown within the application
      if (error instanceof ThrowError) {
        return sendError(res, error.statusCode, error.message);
      } else if (error instanceof Error) {
        // Handle unexpected errors

        return sendError(res, 500, "Internal Server Error");
      } else {
        // Handle unknown errors
        return sendError(res, 500, "Internal Server Error");
      }
    }
  }

  static async updateSpecs(req: Request, res: Response): Promise<any> {
    try {
      console.log("Hitting it or not", req.params.id);
      const userId = req.user?.userId as string;

      const specId = req.params.id as string;
      if (!specId) {
        return sendError(res, 400, "Spec id missing");
      }
      await SpecsService.updateSpecs(userId, specId, req.body);

      return sendSuccess(res, 200, "Specs Updated Succesfully");
    } catch (error) {
      // Handle known errors thrown within the application
      if (error instanceof ThrowError) {
        return sendError(res, error.statusCode, error.message);
      } else if (error instanceof Error) {
        // Handle unexpected errors

        return sendError(res, 500, "Internal Server Error");
      } else {
        // Handle unknown errors
        return sendError(res, 500, "Internal Server Error");
      }
    }
  }
  static async getSpecsOutputData(req: Request, res: Response): Promise<any> {
    try {
      const userId = req.user?.userId as string;
      const specId = req.params.id as string;

      if (!specId) {
        return sendError(res, 400, "Spec id is missing");
      }

      const data = await SpecsService.getSpecsOutputData(userId, specId);

      return sendSuccess(res, 200, "Data retrieved successfully", data);
    } catch (error) {
      // Handle known errors thrown within the application
      if (error instanceof ThrowError) {
        return sendError(res, error.statusCode, error.message);
      } else if (error instanceof Error) {
        // Handle unexpected errors

        return sendError(res, 500, "Internal Server Error");
      } else {
        // Handle unknown errors
        return sendError(res, 500, "Internal Server Error");
      }
    }
  }
}

export default SpecsController;
