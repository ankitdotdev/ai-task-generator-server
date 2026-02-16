"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bcryptCompareHashPassword = exports.bcryptHashPassword = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
// Hashes a plain-text password before storing it in the database
// Uses salt rounds = 10 (balanced choice between security and performance)
const bcryptHashPassword = (password) => {
    return bcryptjs_1.default.hash(password, 10);
};
exports.bcryptHashPassword = bcryptHashPassword;
// Compares a plain-text password with the stored hashed password during login
const bcryptCompareHashPassword = (password, hashPassword) => {
    return bcryptjs_1.default.compare(password, hashPassword);
};
exports.bcryptCompareHashPassword = bcryptCompareHashPassword;
