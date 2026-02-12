import { Router } from "express";
import AuthController from "../controller/auth.controller";

const authRouter = Router(); // Create a modular router for auth-related routes

// Route for user registration
authRouter.post("/register", AuthController.registerUser);

// Route for user login (authentication)
authRouter.post("/login", AuthController.loginUser);

export default authRouter; // Export router to be mounted in main app
