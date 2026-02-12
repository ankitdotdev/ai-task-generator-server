"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = __importDefault(require("../controller/auth.controller"));
const authRouter = (0, express_1.Router)(); // Create a modular router for auth-related routes
// Route for user registration
authRouter.post("/register", auth_controller_1.default.registerUser);
// Route for user login (authentication)
authRouter.post("/login", auth_controller_1.default.loginUser);
exports.default = authRouter; // Export router to be mounted in main app
