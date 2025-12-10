import { OpenRouter } from "@openrouter/sdk";
import { writeFile } from "fs/promises";

const apiKey = process.env.OPENROUTER_API_KEY;
if (!apiKey) {
  throw new Error("OPENROUTER_API_KEY environment variable is required");
}

const openRouter = new OpenRouter({
  apiKey,
});

async function run() {
  const result = await openRouter.models.list();

  // Save complete list to JSON file
  await writeFile("openrouter-models.json", JSON.stringify(result, null, 2));
  console.log("✓ Saved complete model list to openrouter-models.json");

  // Filter models
  const models = result.data;

  // Free models
  const freeModels = models.filter(m =>
    m.pricing.prompt === "0" && m.pricing.completion === "0"
  );

  // Image input support
  const imageInputModels = models.filter(m =>
    m.architecture.inputModalities?.includes("image")
  );

  // Image output support
  const imageOutputModels = models.filter(m =>
    m.architecture.outputModalities?.includes("image")
  );

  // Reasoning support
  const reasoningModels = models.filter(m =>
    m.supportedParameters?.includes("reasoning") ||
    m.supportedParameters?.includes("include_reasoning")
  );

  // Tool calling support
  const toolCallingModels = models.filter(m =>
    m.supportedParameters?.includes("tools")
  );

  // Large context (>100k tokens)
  const largeContextModels = models.filter(m =>
    m.contextLength >= 100000
  );

  console.log("\n=== FREE MODELS ===");
  console.log(`Total: ${freeModels.length}`);
  freeModels.forEach(m => console.log(`- ${m.name} (${m.id})`));

  console.log("\n=== IMAGE INPUT SUPPORT ===");
  console.log(`Total: ${imageInputModels.length}`);
  imageInputModels.slice(0, 10).forEach(m => console.log(`- ${m.name} (${m.id})`));
  if (imageInputModels.length > 10) console.log(`... and ${imageInputModels.length - 10} more`);

  console.log("\n=== IMAGE OUTPUT SUPPORT ===");
  console.log(`Total: ${imageOutputModels.length}`);
  imageOutputModels.forEach(m => console.log(`- ${m.name} (${m.id})`));

  console.log("\n=== REASONING SUPPORT ===");
  console.log(`Total: ${reasoningModels.length}`);
  reasoningModels.slice(0, 10).forEach(m => console.log(`- ${m.name} (${m.id})`));
  if (reasoningModels.length > 10) console.log(`... and ${reasoningModels.length - 10} more`);

  console.log("\n=== TOOL CALLING SUPPORT ===");
  console.log(`Total: ${toolCallingModels.length}`);
  toolCallingModels.slice(0, 10).forEach(m => console.log(`- ${m.name} (${m.id})`));
  if (toolCallingModels.length > 10) console.log(`... and ${toolCallingModels.length - 10} more`);

  console.log("\n=== LARGE CONTEXT (≥100K tokens) ===");
  console.log(`Total: ${largeContextModels.length}`);
  largeContextModels.slice(0, 10).forEach(m =>
    console.log(`- ${m.name}: ${m.contextLength.toLocaleString()} tokens (${m.id})`)
  );
  if (largeContextModels.length > 10) console.log(`... and ${largeContextModels.length - 10} more`);
}

run();
