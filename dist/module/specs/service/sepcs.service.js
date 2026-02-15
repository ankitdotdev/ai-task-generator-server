"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
const prompt_1 = require("../../../constants/prompt");
const errorHandler_1 = __importDefault(require("../../../middleware/errorHandler"));
const hugging_ai_service_1 = __importDefault(require("../../ai/hugging.ai.service"));
const specs_repository_1 = __importStar(require("../repository/specs.repository"));
const specs_validator_1 = __importDefault(require("../validator/specs.validator"));
class SpecsService {
    /**
     * Generates or regenerates structured engineering specs.
     *
     * Responsibilities:
     * - Validate incoming request data
     * - Generate AI prompt
     * - Call AI model
     * - Sanitize and parse AI response
     * - Persist structured result
     * - Return versioned spec output
     */
    static async generateSpecsService(userId, data, specInputId) {
        // Validate and sanitize incoming input
        const validatedBody = specs_validator_1.default.validateInput(data);
        // Build structured AI prompt from validated input
        const prompt = (0, prompt_1.buildPrompt)(validatedBody);
        // Invoke AI model service
        const aiResponse = await (0, hugging_ai_service_1.default)(prompt);
        // Ensure AI returned usable content
        if (!aiResponse?.content) {
            throw new errorHandler_1.default(500, "AI response is empty");
        }
        // Remove markdown wrappers or formatting artifacts
        const rawContent = aiResponse.content;
        const cleaned = rawContent
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();
        let parsedOutput;
        // Parse AI output into structured JSON
        try {
            parsedOutput = JSON.parse(cleaned);
        }
        catch (error) {
            console.error("Invalid AI JSON:", cleaned);
            throw new errorHandler_1.default(500, "AI returned invalid JSON");
        }
        // Persist structured input-output pair with versioning
        const storeResult = await specs_repository_1.default.storeInputOutputOfSpec(validatedBody, parsedOutput, userId, specInputId);
        // Return versioned result to controller
        return {
            specId: storeResult.outputId,
            version: storeResult.version,
            output: parsedOutput,
        };
    }
    static async getSpecsListService(userId) {
        const data = await specs_repository_1.SpecRepository.getSpecList(userId);
        return data;
    }
    static async updateSpecs(userId, specId, data) {
        if (!data) {
            throw new errorHandler_1.default(400, "No response body provided");
        }
        if (!mongodb_1.ObjectId.isValid(specId)) {
            throw new errorHandler_1.default(400, "Invalid Spec Id");
        }
        const validatedBody = specs_validator_1.default.updateSpecOutputValidator(data);
        const isSpecExists = await specs_repository_1.SpecRepository.getSpecOutputCheck(specId);
        if (!isSpecExists) {
            throw new errorHandler_1.default(404, "Spec not found");
        }
        console.log(validatedBody);
        const isUpdated = await specs_repository_1.SpecRepository.updateSpecs(userId, specId, validatedBody);
        if (!isUpdated) {
            throw new errorHandler_1.default(500, "Failed to update specs");
        }
        return;
    }
    static async getSpecsOutputData(userId, specId) {
        const data = await specs_repository_1.SpecRepository.getSpecOutputData(userId, specId);
        if (!data) {
            throw new errorHandler_1.default(404, "Spec not found");
        }
        return data;
    }
}
exports.default = SpecsService;
