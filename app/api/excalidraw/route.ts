import { streamText, convertToModelMessages } from "ai";
import { z } from "zod/v3";
import { resolveModel } from "@/lib/model-provider";

const DEFAULT_MAX_OUTPUT_TOKENS = 12_000;
const MAX_OUTPUT_TOKENS_CAP = 24_000;

export const maxDuration = 60;
export const runtime = "edge";

export async function POST(req: Request) {
    try {
        const { messages, scene, modelConfig } = await req.json();

        const systemMessage = `
You are an Excalidraw scene architect.
Your job is to translate user requests into Excalidraw scenes with elements, styling, and layout.

Rules for interaction:
- Always provide a brief explanation of what you're creating or modifying before using the tool
- Respond conversationally but deliver the final scene via the display_excalidraw tool
- Prefer incremental changes unless the user asks for a complete rebuild
- Keep layouts clean, well-organized, and visually balanced
- Use meaningful text labels and appropriate colors for elements
- Maintain consistent styling across related elements

Tool usage:
- ALWAYS include a complete object: { "elements": [...], "appState": {...}, "files": {...} }
- Provide the scene payload as a structured JSON object inside the tool call
- If unsure, reuse the current scene and apply small changes instead of rebuilding
- Keep coordinates reasonable (within a 1200x800 canvas)
- Never stream raw JSON in text replies; only send it through the tool call
- Exactly ONE display_excalidraw tool call per response

Refer to the Excalidraw format guide for detailed information about the scene structure:
- Elements should have proper coordinates and styling
- Use appropriate element types (rectangle, ellipse, arrow, text, etc.)
- Include descriptive text labels for elements
- Maintain consistent styling across related elements
- Use appState to define canvas properties like background color
`;

        const lastMessage = messages[messages.length - 1];
        const lastMessageText =
            lastMessage.parts?.find((part: any) => part.type === "text")
                ?.text || "";
        const fileParts =
            lastMessage.parts?.filter((part: any) => part.type === "file") ||
            [];

        const formattedTextContent = `
Current scene JSON:
"""json
${scene || '{"elements": [], "appState": {}, "files": {}}'}
"""
User input:
"""md
${lastMessageText}
"""
`;

        const modelMessages = convertToModelMessages(messages);
        let enhancedMessages = [...modelMessages];

        if (enhancedMessages.length > 0) {
            const lastModelMessage = enhancedMessages[enhancedMessages.length - 1];
            if (lastModelMessage.role === "user") {
                const contentParts: any[] = [
                    { type: "text", text: formattedTextContent },
                ];

                for (const filePart of fileParts) {
                    contentParts.push({
                        type: "image",
                        image: filePart.url,
                        mimeType: filePart.mediaType,
                    });
                }

                enhancedMessages = [
                    ...enhancedMessages.slice(0, -1),
                    { ...lastModelMessage, content: contentParts },
                ];
            }
        }

        const { client, model, maxOutputTokens } = resolveModel(modelConfig);
        const outputTokenBudget = Math.min(
            Math.max(
                2_000,
                maxOutputTokens && Number.isFinite(maxOutputTokens)
                    ? Math.floor(maxOutputTokens)
                    : DEFAULT_MAX_OUTPUT_TOKENS
            ),
            MAX_OUTPUT_TOKENS_CAP
        );

        const result = streamText({
            system: systemMessage,
            model: client.chat(model),
            messages: enhancedMessages,
            temperature: 0,
            maxOutputTokens: outputTokenBudget,
            tools: {
                display_excalidraw: {
                    description:
                        "Render an Excalidraw scene by supplying a structured scene payload.",
                    inputSchema: z.object({
                        scene: z.object({
                            elements: z
                                .array(z.record(z.any()))
                                .describe(
                                    "List of Excalidraw elements with coordinates, styles, etc."
                                ),
                            appState: z
                                .record(z.any())
                                .describe("Excalidraw appState object")
                                .optional()
                                .default({}),
                            files: z
                                .record(z.any())
                                .describe("Files map keyed by element ids")
                                .optional()
                                .default({}),
                        }),
                        summary: z
                            .string()
                            .optional()
                            .describe(
                                "Optional short description of what changed"
                            ),
                    }),
                },
            },
        });

        function errorHandler(error: unknown) {
            if (error == null) {
                return "unknown error";
            }
            if (typeof error === "string") {
                return error;
            }
            if (error instanceof Error) {
                return error.message;
            }
            return JSON.stringify(error);
        }

        return result.toUIMessageStreamResponse({
            onError: errorHandler,
        });
    } catch (error) {
        console.error("Error in excalidraw route:", error);
        return Response.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
