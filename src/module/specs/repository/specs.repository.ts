import { ObjectId } from "mongodb";
import {
  AISpecOutput,
  GenerateSpecInput,
  SpecInput,
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
    specInputId?: string, // optional for regeneration
  ): Promise<{ inputId: string; outputId: string; version: number }> {
    const db = Database.getDB();

    // Collections for input metadata and versioned outputs
    const inputCollection = db.collection(this.specInputCollectionName);
    const outputCollection = db.collection(this.specOutputCollectionName);

    // Ensure user context exists
    if (!userId) {
      throw new ThrowError(400, "User ID is required");
    }

    let finalSpecInputId: ObjectId;
    let version = 1;

    /**
     * Case 1: New Spec Creation
     * - Insert input document
     * - Initialize version to 1
     */
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
    } else {
      /**
       * Case 2: Regeneration of Existing Spec
       * - Validate ownership
       * - Increment version based on existing outputs
       */
      finalSpecInputId = new ObjectId(specInputId);

      // Verify spec belongs to user
      const existingInput = await inputCollection.findOne({
        _id: finalSpecInputId,
        userId: new ObjectId(userId),
      });

      if (!existingInput) {
        throw new ThrowError(404, "Spec input not found");
      }

      // Determine next version number
      const existingVersionsCount = await outputCollection.countDocuments({
        specInputId: finalSpecInputId,
      });

      version = existingVersionsCount + 1;
    }

    /**
     * Insert Versioned Output
     * - Each regeneration creates a new version
     * - Input remains immutable
     */
    const outputInsertResult = await outputCollection.insertOne({
      specInputId: finalSpecInputId,
      version,
      output: outputData,
      generatedAt: new Date(),
    });

    if (!outputInsertResult.insertedId) {
      throw new ThrowError(500, "Failed to store spec output");
    }

    // Return identifiers and version metadata
    return {
      inputId: finalSpecInputId.toString(),
      outputId: outputInsertResult.insertedId.toString(),
      version,
    };
  }

  static async getSpecList(userId: string): Promise<SpecInput[]> {
    const specOutputCollection = Database.getDB().collection<SpecInput>(
      this.specOutputCollectionName,
    );

    const data = await specOutputCollection
      .find(
        { userId: new ObjectId(userId), version: 1 },
        { projection: { _id: 1, title: 1 } },
      )
      .sort({ _id: -1 }) // optional: newest first
      .limit(5)
      .toArray();

    return data;
  }

  static async getSpecOutputCheck(specId: string): Promise<boolean> {
    const specOutPutCollection = Database.getDB().collection(
      this.specOutputCollectionName,
    );

    const data = await specOutPutCollection.findOne(
      {
        _id: new ObjectId(specId),
      },
      { projection: { _id: 1 } },
    );

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

    const { modifiedCount } = await specOutPutCollection.updateOne(
      {
        _id: new ObjectId(specId),
        userId: new ObjectId(userId),
      },
      {
        $set: { ...updatedData },
      },
    );

    return modifiedCount > 0;
  }
}

export default SpecRepository;
