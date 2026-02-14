import ThrowError from "../../../middleware/errorHandler";
import {
  AISpecOutput,
  GenerateSpecInput,
  PlatformType,
  RiskSensitivity,
  SpecItem,
} from "../model/specs.model";

class SpecsValidator {
  static validateInput(data: GenerateSpecInput): GenerateSpecInput {
    if (!data || typeof data !== "object") {
      throw new ThrowError(400, "Invalid request body");
    }

    const {
      title,
      goal,
      targetUsers,
      platformType,
      constraints,
      techPreference,
      riskSensitivity,
      ...extraFields
    } = data as GenerateSpecInput;

    // 🚨 Reject unknown fields
    if (Object.keys(extraFields).length > 0) {
      throw new ThrowError(400, "Unknown fields are not allowed");
    }

    // Required validations
    if (!title || typeof title !== "string" || !title.trim()) {
      throw new ThrowError(400, "Title is required");
    }

    if (!goal || typeof goal !== "string" || !goal.trim()) {
      throw new ThrowError(400, "Goal is required");
    }

    if (
      !targetUsers ||
      typeof targetUsers !== "string" ||
      !targetUsers.trim()
    ) {
      throw new ThrowError(400, "Target users is required");
    }

    const allowedPlatforms: PlatformType[] = [
      "web",
      "mobile",
      "internal-tool",
      "api",
    ];

    if (!allowedPlatforms.includes(platformType as PlatformType)) {
      throw new ThrowError(400, "Invalid platform type");
    }

    const allowedRisk: RiskSensitivity[] = ["low", "medium", "high"];

    if (
      riskSensitivity &&
      !allowedRisk.includes(riskSensitivity as RiskSensitivity)
    ) {
      throw new ThrowError(400, "Invalid risk sensitivity value");
    }

    // ✅ Construct clean validated body
    const validatedBody: GenerateSpecInput = {
      title: title.trim(),
      goal: goal.trim(),
      targetUsers: targetUsers.trim(),
      platformType: platformType as PlatformType,
      ...(constraints && typeof constraints === "string"
        ? { constraints: constraints.trim() }
        : {}),
      ...(techPreference && typeof techPreference === "string"
        ? { techPreference: techPreference.trim() }
        : {}),
      ...(riskSensitivity
        ? { riskSensitivity: riskSensitivity as RiskSensitivity }
        : {}),
    };

    return validatedBody;
  }

  static updateSpecOutputValidator(
    data: Partial<AISpecOutput>,
  ): Partial<AISpecOutput> {
    const validatedBody: Partial<AISpecOutput> = {};

    // specInputId
    if (data.specInputId !== undefined) {
      if (typeof data.specInputId !== "string" || !data.specInputId.trim()) {
        throw new ThrowError(400, "specInputId must be a non-empty string");
      }
      validatedBody.specInputId = data.specInputId.trim();
    }

    // version
    if (data.version !== undefined) {
      if (typeof data.version !== "number" || data.version < 0) {
        throw new ThrowError(400, "version must be a positive number");
      }
      validatedBody.version = data.version;
    }

    // generatedAt
    if (data.generatedAt !== undefined) {
      if (
        !(data.generatedAt instanceof Date) ||
        isNaN(data.generatedAt.getTime())
      ) {
        throw new ThrowError(400, "generatedAt must be a valid Date");
      }
      validatedBody.generatedAt = data.generatedAt;
    }

    // aiModel
    if (data.aiModel !== undefined) {
      if (typeof data.aiModel !== "string") {
        throw new ThrowError(400, "aiModel must be a string");
      }
      validatedBody.aiModel = data.aiModel.trim();
    }

    // output (nested object)
    if (data.output !== undefined) {
      if (typeof data.output !== "object" || data.output === null) {
        throw new ThrowError(400, "output must be an object");
      }

      const validatedOutput: Partial<AISpecOutput["output"]> = {};

      const validateSpecItems = (items: SpecItem[], fieldName: string) => {
        if (!Array.isArray(items)) {
          throw new ThrowError(400, `${fieldName} must be an array`);
        }

        return items.map((item) => {
          if (
            typeof item !== "object" ||
            typeof item.id !== "string" ||
            typeof item.content !== "string"
          ) {
            throw new ThrowError(400, `Invalid ${fieldName} item`);
          }

          return {
            id: item.id.trim(),
            content: item.content.trim(),
          };
        });
      };

      if (data.output.userStories !== undefined) {
        validatedOutput.userStories = validateSpecItems(
          data.output.userStories,
          "userStories",
        );
      }

      if (data.output.engineeringTasks !== undefined) {
        validatedOutput.engineeringTasks = validateSpecItems(
          data.output.engineeringTasks,
          "engineeringTasks",
        );
      }

      if (data.output.risks !== undefined) {
        validatedOutput.risks = validateSpecItems(data.output.risks, "risks");
      }

      if (data.output.unknowns !== undefined) {
        validatedOutput.unknowns = validateSpecItems(
          data.output.unknowns,
          "unknowns",
        );
      }

      validatedBody.output = validatedOutput as AISpecOutput["output"];
    }

    return validatedBody;
  }
}

export default SpecsValidator;
