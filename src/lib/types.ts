export type Bin =
  | "recycle"
  | "compost"
  | "landfill"
  | "ewaste"
  | "hazardous"
  | "special";

export interface Verdict {
  item: string;
  condition: string;
  category: string;
  bin: Bin;
  confidence: number;
  reasoning: string;
  ruleTitle?: string;
  ruleDetail?: string;
  source: "ai" | "rulebook" | "demo";
  co2eKg: number;
}

export interface SortRequestBody {
  imageBase64?: string;
  mimeType?: string;
  query?: string;
  sample?: string;
  region?: string;
}

export interface SortResponseBody {
  ok: boolean;
  verdict?: Verdict;
  error?: string;
  degraded?: boolean; // true when AI was unavailable and the rulebook answered
}
