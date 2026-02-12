import express from "express";
import "dotenv/config"; // Loads environment variables from .env file
import Database from "./config/dbConnection";
import authRouter from "./module/auth/router/auth.router";

const app = express();

// Use PORT from environment, fallback to 8001 for local development
const port = process.env.PORT || 8001;

async function startServer() {
  try {
    // Establish database connection before starting the server
    await Database.connect();

    // Base API versioning (helps in future version upgrades)
    const baseUrl = "/api/v1";

    // Middleware to parse incoming JSON requests
    app.use(express.json());

    // Register Auth module routes
    app.use(`${baseUrl}/auth`, authRouter);

    // Start Express server only after DB is connected
    app.listen(port, () => {
      console.log(`Server is listening to port =>`, port);
    });
  } catch (error) {
    // If DB connection fails, log error and terminate process
    console.error(error);
    process.exit(1);
  }
}

// Initialize application
startServer();
