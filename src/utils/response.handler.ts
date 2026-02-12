import { Response } from "express";

// Sends a consistent success response structure across the API
export const sendSuccess = (
  res: Response,
  statusCode: number,
  message: string,
  data?: unknown, // Optional payload returned to the client
) => {
  // Base response object (kept explicit for type safety and clarity)
  const response: {
    success: boolean;
    message: string;
    data?: unknown;
  } = {
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

// Standardized error response formatter to maintain consistent API shape
export const sendError = (
  res: Response,
  statusCode: number,
  message: string,
) => {
  return res.status(statusCode).json({
    success: false,
    message,
  });
};
