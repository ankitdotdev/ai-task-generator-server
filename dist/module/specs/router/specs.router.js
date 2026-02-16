"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const specs_controller_1 = __importDefault(require("../controller/specs.controller"));
const authMiddleware_1 = __importDefault(require("../../../middleware/authMiddleware"));
const specsRouter = (0, express_1.Router)();
specsRouter.use(authMiddleware_1.default.validateToken);
specsRouter.use(authMiddleware_1.default.checkUserExists);
specsRouter.get("/", specs_controller_1.default.getSpecsList);
specsRouter.post("/", specs_controller_1.default.generateSpecs);
specsRouter.get("/:id", specs_controller_1.default.getSpecsOutputData);
specsRouter.patch("/:id", specs_controller_1.default.updateSpecs);
specsRouter.delete("/:id", specs_controller_1.default.deleteSpecs);
exports.default = specsRouter;
