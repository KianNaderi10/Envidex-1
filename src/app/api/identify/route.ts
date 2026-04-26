import { generateText, Output } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";

const SpeciesResultSchema = z.object({
  commonName: z.string(),
  scientificName: z.string(),
  kingdom: z.enum(["Animalia", "Plantae", "Fungi", "Other"]),
  class: z.string(),
  conservationStatus: z.enum(["EX", "EW", "CR", "EN", "VU", "NT", "LC", "DD", "NE"]),
  population: z.string(),
  habitat: z.array(z.string()),
  range: z.string(),
  diet: z.string().optional(),
  description: z.string(),
  threats: z.array(z.string()),
  howToHelp: z.array(z.string()),
  funFacts: z.array(z.string()),
  confidence: z.number().min(0).max(1),
  isIdentifiable: z.boolean(),
  notIdentifiableReason: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const { imageData } = await req.json();

    if (!imageData) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const base64Data = imageData.replace(/^data:image\/[a-z]+;base64,/, "");

    const result = await generateText({
      model: anthropic("claude-sonnet-4.6"),
      experimental_output: Output.object({ schema: SpeciesResultSchema }),
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              image: base64Data,
            },
            {
              type: "text",
              text: `You are a world-class wildlife biologist and botanist. Analyze this image and identify the species shown.

If you can identify a specific animal or plant species, provide accurate information about it. If the image shows something that is NOT a clearly identifiable wild species (e.g., a domestic animal, human, object, or unclear image), set isIdentifiable to false.

For conservation status, use the IUCN Red List categories:
- EX (Extinct), EW (Extinct in Wild), CR (Critically Endangered), EN (Endangered), VU (Vulnerable), NT (Near Threatened), LC (Least Concern), DD (Data Deficient), NE (Not Evaluated)

Provide 3-4 specific, actionable ways people can help this species. Include 3 interesting, surprising fun facts. Be accurate and scientifically rigorous.`,
            },
          ],
        },
      ],
    });

    const data = result.experimental_output;
    const id = data.scientificName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    return NextResponse.json({ ...data, id });
  } catch (error) {
    console.error("Species identification error:", error);
    return NextResponse.json(
      { error: "Failed to identify species" },
      { status: 500 }
    );
  }
}
