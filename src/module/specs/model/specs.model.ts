import { ObjectId } from "mongodb";

export type PlatformType = "web" | "mobile" | "internal-tool" | "api";

export type RiskSensitivity = "low" | "medium" | "high";

export interface GenerateSpecInput {
  // Required
  title: string;
  goal: string;
  targetUsers: string;
  platformType: PlatformType;

  // Optional
  constraints?: string;
  techPreference?: string;
  riskSensitivity?: RiskSensitivity;
}

export interface SpecItem {
  id: string;
  content: string;
}

export interface AISpecOutput {
  specInputId: string;
  version: number;
  output: {
    userStories: SpecItem[];
    engineeringTasks: SpecItem[];
    risks: SpecItem[];
    unknowns: SpecItem[];
  };

  aiModel?: string;
  generatedAt: Date;
}




export interface SpecListItem  {
  _id: ObjectId;
  title: string;
}
