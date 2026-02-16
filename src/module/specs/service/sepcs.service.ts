import { ObjectId } from "mongodb";
import { buildPrompt } from "../../../constants/prompt";
import ThrowError from "../../../middleware/errorHandler";
import queryModel from "../../ai/hugging.ai.service";
import {
  AISpecOutput,
  GenerateSpecInput,
  SpecListItem,
} from "../model/specs.model";
import SpecsRepository, {
  SpecRepository,
} from "../repository/specs.repository";
import SpecsValidator from "../validator/specs.validator";

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
  static async generateSpecsService(
    userId: string,
    data: GenerateSpecInput,
    specInputId?: string,
  ): Promise<{
    specId: string;
    version: number;
    output: any;
  }> {
    // Validate and sanitize incoming input
    const validatedBody = SpecsValidator.validateInput(data);

    // Build structured AI prompt from validated input
    const prompt = buildPrompt(validatedBody);

    // Invoke AI model service
    const aiResponse = await queryModel(prompt);

    // Ensure AI returned usable content
    if (!aiResponse?.content) {
      throw new ThrowError(500, "AI response is empty");
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
    } catch (error) {
      console.error("Invalid AI JSON:", cleaned);
      throw new ThrowError(500, "AI returned invalid JSON");
    }

    // Persist structured input-output pair with versioning
    const storeResult = await SpecsRepository.storeInputOutputOfSpec(
      validatedBody,
      parsedOutput,
      userId,
      specInputId,
    );

    // Return versioned result to controller
    return {
      specId: storeResult.outputId,
      version: storeResult.version,
      output: parsedOutput,
    };
  }

  static async getSpecsListService(userId: string): Promise<SpecListItem[]> {
    const data = await SpecRepository.getSpecList(userId);

    return data;
  }

  static async updateSpecs(
    userId: string,
    specId: string,
    data: Partial<AISpecOutput>,
  ): Promise<void> {
    if (!data) {
      throw new ThrowError(400, "No response body provided");
    }

    if (!ObjectId.isValid(specId)) {
      throw new ThrowError(400, "Invalid Spec Id");
    }

    const validatedBody = SpecsValidator.updateSpecOutputValidator(data);

    const isSpecExists = await SpecRepository.getSpecOutputCheck(specId);

    if (!isSpecExists) {
      throw new ThrowError(404, "Spec not found");
    }

    console.log(validatedBody);

    const isUpdated = await SpecRepository.updateSpecs(
      userId,
      specId,
      validatedBody,
    );

    if (!isUpdated) {
      throw new ThrowError(500, "Failed to update specs");
    }
    return;
  }

  static async getSpecsOutputData(
    userId: string,
    specId: string,
  ): Promise<AISpecOutput> {
    const data = await SpecRepository.getSpecOutputData(userId, specId);

    if (!data) {
      throw new ThrowError(404, "Spec not found");
    }

    return data;
  }

  static async deleteSpecs(userId: string, specId: string): Promise<void> {
    const data = await SpecRepository.getSpecOutputData(userId,specId);

    if (!data) {
      throw new ThrowError(404, "No task found to delete");
    }

    const result = await SpecRepository.deleteSpecs(userId, specId,data.specInputId);

    if (!result) {
      throw new ThrowError(500, "Failed to delete");
    }

    return;
  }
}

export default SpecsService;
