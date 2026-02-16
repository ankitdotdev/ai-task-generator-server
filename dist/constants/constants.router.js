"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const constantRouter = (0, express_1.Router)();
constantRouter.get("/", (_req, res) => {
    return res.status(200).json({ status: "Server is running" });
});
constantRouter.get("/health", (_req, res) => {
    return res.status(200).json({ status: "Server is running healthy" });
});
exports.default = constantRouter;
