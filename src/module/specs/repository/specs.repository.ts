import { ObjectId } from "mongodb";
import {
  AISpecOutput,
  GenerateSpecInput,
  SpecListItem,
} from "../model/specs.model";
import Database from "../../../config/dbConnection";
import ThrowError from "../../../middleware/errorHandler";

export class SpecRepository {
  /**
   * Persists spec input and its corresponding AI-generated output.
   *
   * Handles:
   * - New spec creation (version = 1)
   * - Regeneration of existing spec (increment version)
   * - Versioned output storage
   */

  private static specInputCollectionName = "specs_input";
  private static specOutputCollectionName = "specs_output";

  static async storeInputOutputOfSpec(
    inputData: GenerateSpecInput,
    outputData: any,
    userId: string,
    specInputId?: string,
  ): Promise<{
    inputId: string;
    outputId: string;
    version: number;
    generatedAt: Date;
  }> {
    const db = Database.getDB();

    const inputCollection = db.collection(this.specInputCollectionName);

    const outputCollection = db.collection(this.specOutputCollectionName);

    if (!userId) {
      throw new ThrowError(400, "User ID is required");
    }

    let finalSpecInputId: ObjectId;
    let version = 1;

    // CASE 1: New Spec
    if (!specInputId) {
      const inputInsertResult = await inputCollection.insertOne({
        userId: new ObjectId(userId),

        ...inputData,

        createdAt: new Date(),
      });

      if (!inputInsertResult.insertedId) {
        throw new ThrowError(500, "Failed to store spec input");
      }

      finalSpecInputId = inputInsertResult.insertedId;

      version = 1;
    }

    // CASE 2: Regeneration
    else {
      finalSpecInputId = new ObjectId(specInputId);

      const existingInput = await inputCollection.findOne({
        _id: finalSpecInputId,

        userId: new ObjectId(userId),
      });

      if (!existingInput) {
        throw new ThrowError(404, "Spec input not found");
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
      userId: new ObjectId(userId),

      generatedAt,
    };

    const outputInsertResult = await outputCollection.insertOne(outputDoc);

    if (!outputInsertResult.insertedId) {
      throw new ThrowError(500, "Failed to store spec output");
    }

    // Return everything needed by frontend
    return {
      inputId: finalSpecInputId.toString(),
      outputId: outputInsertResult.insertedId.toString(),
      version,
      generatedAt,
    };
  }

  static async getSpecList(userId: string): Promise<SpecListItem[]> {
    const db = Database.getDB();

    const specOutputCollection = db.collection(this.specOutputCollectionName);

    const data = await specOutputCollection
      .aggregate<SpecListItem>([
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
            "inputDoc.userId": new ObjectId(userId),
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

  static async getSpecOutputCheck(specId: string): Promise<boolean> {
    const specOutPutCollection = Database.getDB().collection(
      this.specOutputCollectionName,
    );
    console.log("Spec id", specId);
    const data = await specOutPutCollection.findOne(
      {
        _id: new ObjectId(specId),
      },
      { projection: { _id: 1 } },
    );

    console.log("Edit shit check", data);
    return Boolean(data?._id);
  }

  static async updateSpecs(
    userId: string,
    specId: string,
    updatedData: Partial<AISpecOutput>,
  ): Promise<boolean> {
    const specOutPutCollection = Database.getDB().collection(
      this.specOutputCollectionName,
    );
    console.log("Updated data check", updatedData);
    const { modifiedCount } = await specOutPutCollection.updateOne(
      {
        _id: new ObjectId(specId),
        userId: new ObjectId(userId),
      },
      {
        $set: { ...updatedData, updatedAt: new Date() },
      },
    );

    return modifiedCount > 0;
  }

  static async getSpecOutputData(
    userId: string,
    specId: string,
  ): Promise<AISpecOutput> {
    const specOutputCollection = Database.getDB().collection<AISpecOutput>(
      this.specOutputCollectionName,
    );

    const data = (await specOutputCollection.findOne({
      _id: new ObjectId(specId),
      userId: new ObjectId(userId),
    })) as AISpecOutput;

    return data;
  }
}

export default SpecRepository;
