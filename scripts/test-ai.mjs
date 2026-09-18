import { generateObject } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { z } from "zod";
import fs from "fs";

const raw = fs.readFileSync(".env.local", "utf8").match(/GOOGLE_GENERATIVE_AI_API_KEY=(.+)/);
const key = raw ? raw[1].trim() : "";
console.log("key length:", key.length, "| starts:", key.slice(0, 6), "| has spaces:", /\s/.test(key), "| has quotes:", /["']/.test(key));

if (!key || key.includes("PASTE")) {
  console.error("No real key in .env.local yet — paste your Google AI Studio key into it first.");
  process.exit(1);
}

const google = createGoogleGenerativeAI({ apiKey: key });
try {
  const { object } = await generateObject({
    model: google("gemini-flash-latest"),
    schema: z.object({ item: z.string(), bin: z.string() }),
    prompt: "A greasy pizza box. In 2 fields: what item is it, and which bin (recycle/compost/landfill)?",
    abortSignal: AbortSignal.timeout(20_000),
  });
  console.log("AI OK:", JSON.stringify(object));
} catch (e) {
  console.error("AI FAILED:", e?.message ?? e);
  if (e?.responseBody) console.error("body:", String(e.responseBody).slice(0, 500));
}
