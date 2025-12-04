import { streamText, convertToModelMessages } from "ai";
import { z } from "zod/v3";
import { resolveModel } from "@/lib/model-provider";

export const maxDuration = 60;
export const runtime = "edge";

export async function POST(req: Request) {
    try {
        const { messages, definition, modelConfig } = await req.json();

        const systemMessage = `
You are a PlantUML expert.
Translate user intent into clean, well-structured PlantUML diagrams (sequence/class/component/activity/etc.).

Rules:
- Always reason about the provided "Current PlantUML snippet" before responding.
- Respond conversationally but deliver the final code exclusively via the display_plantuml tool.
- Prefer incremental edits unless the user requests a full rewrite.
- Keep lifelines, participants, and relationships clearly labeled.
- Use whitespace, titles, and notes to maintain readability.
- If the diagram must include colors or styling, use standard PlantUML directives.

Tool usage:
- Exactly one display_plantuml tool call per assistant turn.
- Include the entire PlantUML definition (between @startuml ... @enduml).
- Optionally include a short summary describing key changes.
`;

        const lastMessage = messages[messages.length - 1];
        const lastMessageText =
            lastMessage.parts?.find((part: any) => part.type === "text")
                ?.text || "";
        const fileParts =
            lastMessage.parts?.filter((part: any) => part.type === "file") ||
            [];

        const formattedTextContent = `
Current PlantUML snippet:
"""plantuml
${definition || "@startuml\n@enduml"}
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
                display_plantuml: {
                    description:
                        "Render a PlantUML diagram. Provide the full snippet including @startuml ... @enduml.",
                    inputSchema: z.object({
                        definition: z
                            .string()
                            .describe("Complete PlantUML code to render"),
                        summary: z
                            .string()
                            .optional()
                            .describe("Optional short change summary"),
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
        console.error("Error in plantuml route:", error);
        return Response.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
