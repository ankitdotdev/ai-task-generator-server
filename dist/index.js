import express from "express";
import "dotenv/config";
const app = express();
const port = process.env.PORT || 8001;
async function startServer() {
    try {
        app.listen(port, () => {
            console.log(`Server is listening to port =>`, port);
        });
    }
    catch (error) {
        console.error(error);
        process.exit(1);
    }
}
startServer();
