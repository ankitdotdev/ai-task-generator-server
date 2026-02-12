"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
require("dotenv/config"); // Loads environment variables from .env file
const dbConnection_1 = __importDefault(require("./config/dbConnection"));
const auth_router_1 = __importDefault(require("./module/auth/router/auth.router"));
const app = (0, express_1.default)();
// Use PORT from environment, fallback to 8001 for local development
const port = process.env.PORT || 8001;
async function startServer() {
    try {
        // Establish database connection before starting the server
        await dbConnection_1.default.connect();
        // Base API versioning (helps in future version upgrades)
        const baseUrl = "/api/v1";
        // Middleware to parse incoming JSON requests
        app.use(express_1.default.json());
        // Register Auth module routes
        app.use(`${baseUrl}/auth`, auth_router_1.default);
        // Start Express server only after DB is connected
        app.listen(port, () => {
            console.log(`Server is listening to port =>`, port);
        });
    }
    catch (error) {
        // If DB connection fails, log error and terminate process
        console.error(error);
        process.exit(1);
    }
}
// Initialize application
startServer();
