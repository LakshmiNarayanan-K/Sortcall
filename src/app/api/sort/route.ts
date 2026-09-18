import { generateObject } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { z } from "zod";
import { co2eForBin, getRegionNote, verdictFromRulebook } from "@/lib/verdict";
import type { Bin, SortRequestBody, SortResponseBody, Verdict } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const BIN_VALUES = ["recycle", "compost", "landfill", "ewaste", "hazardous", "special"] as const;

const analysisSchema = z.object({
  item: z.string().describe("Short common name of the item, e.g. 'pizza box'"),
  condition: z
    .string()
    .describe("Physical condition in a few words, e.g. 'greasy with cheese residue' or 'clean and empty'"),
  contaminationLevel: z.enum(["clean", "light", "heavy"]).describe("How contaminated the item is"),
  isRecyclingSymbolVisible: z.boolean(),
  category: z.enum(["Paper", "Plastic", "Metal", "Glass", "Organic", "E-waste", "Hazardous", "Textile", "Other"]),
  suggestedBin: z.enum(BIN_VALUES),
  reasoning: z.string().describe("One plain-language sentence explaining the verdict to a curious 12-year-old"),
});

export async function POST(req: Request): Promise<Response> {
  let body: SortRequestBody;
  try {
    body = (await req.json()) as SortRequestBody;
  } catch {
    return Response.json({ ok: false, error: "Invalid JSON body" } satisfies SortResponseBody, { status: 400 });
  }

  const { imageBase64, mimeType, query, sample, region = "us-generic" } = body;
  const hasImage = typeof imageBase64 === "string" && imageBase64.length > 0;

  if (!hasImage && !query) {
    return Response.json(
      { ok: false, error: "Provide an image or a text description" } satisfies SortResponseBody,
      { status: 400 }
    );
  }

  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY ?? process.env.ANTHROPIC_API_KEY;

  // ---- Fallback 1: no API key configured -> rulebook ----
  if (!apiKey) {
    const fallback = verdictFromRulebook(query ?? sample ?? "waste item", region) ?? undefined;
    return Response.json({ ok: true, verdict: fallback, degraded: true } satisfies SortResponseBody, { status: 200 });
  }

  // ---- Primary path: multimodal AI verdict (Gemini 2.0 Flash, free tier) ----
  const google = createGoogleGenerativeAI({ apiKey });
  const regionNote = getRegionNote(region);

  const promptText = [
    sample ? `Sample scenario described by the app: "${sample}".` : null,
    query && !sample ? `User description of the item: "${query}".` : null,
    `Determine what this item is, its physical condition, and how it should be disposed of.`,
    `Local program context: ${regionNote}`,
    `Contamination is the deciding factor: the same item can go to different bins depending on condition (grease, liquids, broken parts, leftover contents).`,
    `Choose the bin from: recycle (curbside), compost (organics), landfill (trash), ewaste (electronics drop-off), hazardous (hazmat drop-off), special (store drop-off e.g. plastic film or textiles).`,
    `If the bin should be drop-off based, prefer ewaste / hazardous / special over landfill.`,
  ]
    .filter(Boolean)
    .join(" ");

  const messages = [
    {
      role: "user" as const,
      content: [
        ...(hasImage
          ? [{ type: "image" as const, image: new URL(`data:${mimeType ?? "image/jpeg"};base64,${imageBase64}`) }]
          : []),
        { type: "text" as const, text: promptText },
      ],
    },
  ];

  // Model fallback chain: main model -> lite model. Each call fails fast (1 retry).
  const MODELS = ["gemini-flash-latest", "gemini-flash-lite-latest"];
  let object: z.infer<typeof analysisSchema> | null = null;
  let lastErr: unknown = null;
  for (const modelId of MODELS) {
    try {
      const result = await generateObject({
        model: google(modelId),
        schema: analysisSchema,
        messages,
        maxRetries: 1,
        abortSignal: AbortSignal.timeout(15_000),
      });
      object = result.object;
      break;
    } catch (err) {
      lastErr = err;
      console.error(`[sort] model ${modelId} failed:`, err instanceof Error ? err.message : err);
    }
  }

  try {
    if (!object) throw lastErr;

    const bin = object.suggestedBin as Bin;
    const verdict: Verdict = {
      item: object.item,
      condition: object.condition,
      category: object.category,
      bin,
      confidence: 0.9,
      reasoning: object.reasoning,
      source: "ai",
      co2eKg: co2eForBin(bin),
    };
    return Response.json({ ok: true, verdict } satisfies SortResponseBody, { status: 200 });
  } catch (err) {
    console.error("[sort] AI call failed, falling back to rulebook:", err);
    // ---- Fallback 2: AI failed -> rulebook ----
    const fallback = verdictFromRulebook(query ?? sample ?? "", region) ?? undefined;
    return Response.json({ ok: true, verdict: fallback, degraded: true } satisfies SortResponseBody, { status: 200 });
  }
}
