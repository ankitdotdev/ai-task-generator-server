import { NextFunction, Request, Response } from "express";

import { sendError } from "../utils/response.handler";
import jwt from "jsonwebtoken";
import Database from "../config/dbConnection";
import { ObjectId } from "mongodb";

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
      };
    }
  }
}

class AuthMiddleware {
  static async validateToken(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return sendError(res, 401, "Auth header is missing");
    }

    const parts = authHeader.split(" ");

    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return sendError(res, 401, "Invalid authorization format");
    }

    const token = parts[1];

    if (!token) {
      return sendError(res, 401, "Token is missing");
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY!) as {
        userId: string;
      };

      if (!decoded.userId) {
        return sendError(res, 401, "Unauthorized Access");
      }
      req.user = {
        userId: decoded.userId,
      };

      next();
    } catch (error) {
      return sendError(res, 401, "Invalid or expired token");
    }
  }

  // checkUser.middleware.ts
  static async checkUserExists(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const userId = req.user?.userId;

    const user = await Database.getDB()
      .collection("users")
      .findOne({ _id: new ObjectId(userId) });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    next();
  }
}

export default AuthMiddleware;
