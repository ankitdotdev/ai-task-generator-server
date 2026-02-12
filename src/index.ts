import express from "express";
import "dotenv/config";
import Database from "./config/dbConnection";

const app = express();

const port = process.env.PORT || 8001;

async function startServer() {
  try {
    await Database.connect();

    app.listen(port, () => {
      console.log(`Server is listening to port =>`, port);
    });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

startServer();
