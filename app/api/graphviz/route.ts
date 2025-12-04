import { streamText, convertToModelMessages } from "ai";
import { z } from "zod/v3";
import { resolveModel } from "@/lib/model-provider";

export const maxDuration = 60;
export const runtime = "edge";

export async function POST(req: Request) {
    try {
        const { messages, definition, modelConfig } = await req.json();

        const systemMessage = `
You are an expert Graphviz (DOT language) diagram assistant.
Your job is to translate user intent into clean, well-organized Graphviz syntax.

Graphviz Rules:
- Always use proper DOT syntax (digraph, graph, or subgraph)
- Use meaningful node and edge labels
- Keep layouts clean and readable
- Use appropriate graph attributes for styling
- Add helpful comments when needed

Rules of engagement:
- Always reason about the provided "Current Graphviz definition" before replying.
- Respond conversationally but deliver the final code via the display_graphviz tool.
- Prefer incremental edits unless the user asks to rebuild from scratch.
- Keep labels concise, ensure indentation is consistent.
- Never return diagram code directly in text responses.

Tool contract:
- You must trigger exactly one display_graphviz tool call per assistant turn.
- Include the full Graphviz definition inside that tool call.
- Optionally include a short summary describing the key changes.
`;

        const lastMessage = messages[messages.length - 1];
        const lastMessageText =
            lastMessage.parts?.find((part: any) => part.type === "text")
                ?.text || "";
        const fileParts =
            lastMessage.parts?.filter((part: any) => part.type === "file") ||
            [];

        const formattedTextContent = `
Current Graphviz definition:
"""dot
${definition || "digraph G {\n  A -> B\n}"}
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

        const { client, model } = resolveModel(modelConfig);

        const result = streamText({
            system: systemMessage,
            model: client.chat(model),
            messages: enhancedMessages,
            temperature: 0.2,
            tools: {
                display_graphviz: {
                    description:
                        "Render a Graphviz diagram by providing the full DOT definition.",
                    inputSchema: z.object({
                        definition: z
                            .string()
                            .describe(
                                "Complete Graphviz DOT definition for the diagram"
                            ),
                        summary: z
                            .string()
                            .optional()
                            .describe(
                                "Optional short explanation of what changed"
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
        console.error("Error in graphviz route:", error);
        return Response.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}