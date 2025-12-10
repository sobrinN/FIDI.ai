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
  const models = result.data;

  // Filter models
  const freeModels = models.filter(m =>
    m.pricing.prompt === "0" && m.pricing.completion === "0"
  );

  const imageInputModels = models.filter(m =>
    m.architecture.inputModalities?.includes("image")
  );

  const imageOutputModels = models.filter(m =>
    m.architecture.outputModalities?.includes("image")
  );

  const reasoningModels = models.filter(m =>
    m.supportedParameters?.includes("reasoning") ||
    m.supportedParameters?.includes("include_reasoning")
  );

  const toolCallingModels = models.filter(m =>
    m.supportedParameters?.includes("tools")
  );

  const largeContextModels = models.filter(m =>
    m.contextLength >= 100000
  );

  // Create organized output
  const organized = {
    free_models: freeModels.map(m => ({
      id: m.id,
      name: m.name,
      context_length: m.contextLength
    })),
    image_input_support: imageInputModels.map(m => ({
      id: m.id,
      name: m.name,
      context_length: m.contextLength
    })),
    image_output_support: imageOutputModels.map(m => ({
      id: m.id,
      name: m.name
    })),
    reasoning_support: reasoningModels.map(m => ({
      id: m.id,
      name: m.name,
      context_length: m.contextLength
    })),
    tool_calling_support: toolCallingModels.map(m => ({
      id: m.id,
      name: m.name,
      context_length: m.contextLength
    })),
    large_context_models: largeContextModels
      .sort((a, b) => b.contextLength - a.contextLength)
      .map(m => ({
        id: m.id,
        name: m.name,
        context_length: m.contextLength
      }))
  };

  // Save to JSON
  await writeFile("openrouter-model-ids.json", JSON.stringify(organized, null, 2));
  console.log("✓ Saved organized model IDs to openrouter-model-ids.json\n");

  // Print summary with IDs
  console.log("=== FREE MODELS ===");
  console.log(`Total: ${freeModels.length}\n`);
  freeModels.forEach(m => console.log(m.id));

  console.log("\n\n=== IMAGE INPUT SUPPORT (first 20) ===");
  console.log(`Total: ${imageInputModels.length}\n`);
  imageInputModels.slice(0, 20).forEach(m => console.log(m.id));

  console.log("\n\n=== IMAGE OUTPUT SUPPORT ===");
  console.log(`Total: ${imageOutputModels.length}\n`);
  imageOutputModels.forEach(m => console.log(m.id));

  console.log("\n\n=== REASONING SUPPORT (first 20) ===");
  console.log(`Total: ${reasoningModels.length}\n`);
  reasoningModels.slice(0, 20).forEach(m => console.log(m.id));

  console.log("\n\n=== TOOL CALLING SUPPORT (first 20) ===");
  console.log(`Total: ${toolCallingModels.length}\n`);
  toolCallingModels.slice(0, 20).forEach(m => console.log(m.id));

  console.log("\n\n=== LARGE CONTEXT (top 20 by size) ===");
  console.log(`Total: ${largeContextModels.length}\n`);
  largeContextModels
    .sort((a, b) => b.contextLength - a.contextLength)
    .slice(0, 20)
    .forEach(m => console.log(`${m.id} (${m.contextLength.toLocaleString()} tokens)`));
}

run();
