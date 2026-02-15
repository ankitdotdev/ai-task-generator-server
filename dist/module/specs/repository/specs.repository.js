"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpecRepository = void 0;
const mongodb_1 = require("mongodb");
const dbConnection_1 = __importDefault(require("../../../config/dbConnection"));
const errorHandler_1 = __importDefault(require("../../../middleware/errorHandler"));
class SpecRepository {
    static async storeInputOutputOfSpec(inputData, outputData, userId, specInputId) {
        const db = dbConnection_1.default.getDB();
        const inputCollection = db.collection(this.specInputCollectionName);
        const outputCollection = db.collection(this.specOutputCollectionName);
        if (!userId) {
            throw new errorHandler_1.default(400, "User ID is required");
        }
        let finalSpecInputId;
        let version = 1;
        // CASE 1: New Spec
        if (!specInputId) {
            const inputInsertResult = await inputCollection.insertOne({
                userId: new mongodb_1.ObjectId(userId),
                ...inputData,
                createdAt: new Date(),
            });
            if (!inputInsertResult.insertedId) {
                throw new errorHandler_1.default(500, "Failed to store spec input");
            }
            finalSpecInputId = inputInsertResult.insertedId;
            version = 1;
        }
        // CASE 2: Regeneration
        else {
            finalSpecInputId = new mongodb_1.ObjectId(specInputId);
            const existingInput = await inputCollection.findOne({
                _id: finalSpecInputId,
                userId: new mongodb_1.ObjectId(userId),
            });
            if (!existingInput) {
                throw new errorHandler_1.default(404, "Spec input not found");
            }
            const existingVersionsCount = await outputCollection.countDocuments({
                specInputId: finalSpecInputId,
            });
            version = existingVersionsCount + 1;
        }
        // Create output document
        const generatedAt = new Date();
        const outputDoc = {
            specInputId: finalSpecInputId,
            version,
            output: outputData,
            userId: new mongodb_1.ObjectId(userId),
            generatedAt,
        };
        const outputInsertResult = await outputCollection.insertOne(outputDoc);
        if (!outputInsertResult.insertedId) {
            throw new errorHandler_1.default(500, "Failed to store spec output");
        }
        // Return everything needed by frontend
        return {
            inputId: finalSpecInputId.toString(),
            outputId: outputInsertResult.insertedId.toString(),
            version,
            generatedAt,
        };
    }
    static async getSpecList(userId) {
        const db = dbConnection_1.default.getDB();
        const specOutputCollection = db.collection(this.specOutputCollectionName);
        const data = await specOutputCollection
            .aggregate([
            // ✅ THIS FIXES THE ERROR
            {
                $lookup: {
                    from: this.specInputCollectionName,
                    localField: "specInputId",
                    foreignField: "_id",
                    as: "inputDoc",
                },
            },
            {
                $unwind: "$inputDoc",
            },
            {
                $match: {
                    "inputDoc.userId": new mongodb_1.ObjectId(userId),
                },
            },
            {
                $project: {
                    _id: 1,
                    title: "$inputDoc.title",
                },
            },
            {
                $sort: {
                    _id: -1,
                },
            },
            {
                $limit: 5,
            },
        ])
            .toArray();
        return data;
    }
    static async getSpecOutputCheck(specId) {
        const specOutPutCollection = dbConnection_1.default.getDB().collection(this.specOutputCollectionName);
        console.log("Spec id", specId);
        const data = await specOutPutCollection.findOne({
            _id: new mongodb_1.ObjectId(specId),
        }, { projection: { _id: 1 } });
        console.log("Edit shit check", data);
        return Boolean(data?._id);
    }
    static async updateSpecs(userId, specId, updatedData) {
        const specOutPutCollection = dbConnection_1.default.getDB().collection(this.specOutputCollectionName);
        console.log("Updated data check", updatedData);
        const { modifiedCount } = await specOutPutCollection.updateOne({
            _id: new mongodb_1.ObjectId(specId),
            userId: new mongodb_1.ObjectId(userId),
        }, {
            $set: { ...updatedData, updatedAt: new Date() },
        });
        return modifiedCount > 0;
    }
    static async getSpecOutputData(userId, specId) {
        const specOutputCollection = dbConnection_1.default.getDB().collection(this.specOutputCollectionName);
        const data = (await specOutputCollection.findOne({
            _id: new mongodb_1.ObjectId(specId),
            userId: new mongodb_1.ObjectId(userId),
        }));
        return data;
    }
}
exports.SpecRepository = SpecRepository;
/**
 * Persists spec input and its corresponding AI-generated output.
 *
 * Handles:
 * - New spec creation (version = 1)
 * - Regeneration of existing spec (increment version)
 * - Versioned output storage
 */
SpecRepository.specInputCollectionName = "specs_input";
SpecRepository.specOutputCollectionName = "specs_output";
exports.default = SpecRepository;
