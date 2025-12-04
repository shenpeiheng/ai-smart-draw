import { streamText, convertToModelMessages } from "ai";
import { z } from "zod/v3";
import { resolveModel } from "@/lib/model-provider";

export const maxDuration = 60;
export const runtime = "edge";

export async function POST(req: Request) {
    try {
        const { messages, definition, modelConfig } = await req.json();

        const systemMessage = `
You are an expert diagram assistant that can work with various diagram formats supported by Kroki (https://kroki.io).
Your job is to translate user intent into clean, well-organized diagram syntax for any of the supported formats.

Kroki supports exactly 28 diagram formats:

1. PlantUML - for UML diagrams, activity diagrams, sequence diagrams, etc.
2. Mermaid - for flowcharts, sequence diagrams, Gantt charts, etc.
3. BPMN - for business process modeling
4. Graphviz (DOT) - for graph visualization
5. BlockDiag - for block diagrams
6. SeqDiag - for sequence diagrams
7. ActDiag - for activity diagrams
8. NwDiag - for network diagrams
9. C4-PlantUML - for software architecture diagrams
10. Ditaa - for ascii-to-image conversion
11. Erd - for entity relationship diagrams
12. Excalidraw - for hand-drawn like sketches
13. Nomnoml - for nomnoml diagrams
14. Pikchr - for pikchr diagrams
15. Structurizr - for software architecture diagrams
16. Svgbob - for ascii-to-svg conversion
17. Umlet - for UML diagrams
18. Vega - for data visualizations
19. Vega-Lite - for data visualizations
20. WaveDrom - for waveform diagrams
21. Bytefield - for binary data field diagrams
22. D2 - for modern diagram scripting language
23. DBML - for database markup language
24. Symbolator - for HDL component diagrams
25. TikZ - for LaTeX-based diagrams
26. WireViz - for cable and connector documentation
27. PacketDiag - for packet diagrams
28. RackDiag - for rack diagrams

Rules of engagement:
- Always reason about the provided "Current diagram definition" before replying.
- Respond conversationally but deliver the final code via the display_kroki tool.
- Prefer incremental edits unless the user asks to rebuild from scratch.
- Keep labels concise, ensure indentation is consistent, and add helpful comments sparingly.
- Never return diagram code directly in text responses.

Tool contract:
- You must trigger exactly one display_kroki tool call per assistant turn.
- Include the full diagram definition inside that tool call.
- Optionally include a short summary describing the key changes.

When creating diagrams:
- Choose the most appropriate format for the user's needs
- For business process diagrams, use BPMN
- For software architecture, consider C4-PlantUML or Structurizr
- For data visualizations, use Vega or Vega-Lite
- For general flowcharts, use PlantUML or Mermaid
- For network diagrams, use Graphviz or NwDiag
`;

        const lastMessage = messages[messages.length - 1];
        const lastMessageText =
            lastMessage.parts?.find((part: any) => part.type === "text")
                ?.text || "";
        const fileParts =
            lastMessage.parts?.filter((part: any) => part.type === "file") ||
            [];

        const formattedTextContent = `
Current diagram definition:
"""diagram
${definition || "@startuml\nAlice -> Bob: Hello\n@enduml"}
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
                display_kroki: {
                    description:
                        "Render a diagram using Kroki by providing the full definition.",
                    inputSchema: z.object({
                        definition: z
                            .string()
                            .describe(
                                "Complete diagram definition for the diagram"
                            ),
                        summary: z
                            .string()
                            .optional()
                            .describe(
                                "Optional short explanation of what changed"
                            ),
                        diagramType: z
                            .string()
                            .optional()
                            .describe(
                                "The type of diagram being generated (e.g., plantuml, mermaid, graphviz, etc.)"
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
        console.error("Error in kroki route:", error);
        return Response.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}