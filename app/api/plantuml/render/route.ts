import { NextRequest, NextResponse } from "next/server";
import { encode } from "plantuml-encoder";

export const runtime = "edge";

const DEFAULT_RENDERERS = [
    process.env.PLANTUML_RENDER_BASE?.replace(/\/$/, ""),
    "https://www.plantuml.com/plantuml/svg",
    "http://vg.007988.xyz:8000/plantuml/svg",
    "https://kroki.io/plantuml/svg",
].filter((value): value is string => Boolean(value && value.trim().length > 0));

export async function POST(request: NextRequest) {
    let definition: string | undefined;

    try {
        const body = await request.json();
        definition = body?.definition;
    } catch {
        return NextResponse.json(
            { error: "Invalid request body. Expected JSON with a definition field." },
            { status: 400 }
        );
    }

    if (!definition || !definition.trim()) {
        return NextResponse.json(
            { error: "PlantUML definition cannot be empty." },
            { status: 400 }
        );
    }

    const encoded = encode(definition);
    const renderers = DEFAULT_RENDERERS.length > 0 ? DEFAULT_RENDERERS : ["https://www.plantuml.com/plantuml/svg"];
    const errors: string[] = [];

    for (const renderer of renderers) {
        const url = `${renderer}/${encoded}`;
        try {
            const response = await fetch(url, {
                cache: "no-store",
            });

            if (!response.ok) {
                errors.push(
                    `${renderer} responded with ${response.status} ${response.statusText || ""}`.trim()
                );
                continue;
            }

            const contentType = response.headers.get("content-type") ?? "image/svg+xml";
            if (!contentType.includes("svg")) {
                const buffer = Buffer.from(await response.arrayBuffer());
                const dataUrl = `data:${contentType};base64,${buffer.toString("base64")}`;
                return NextResponse.json({
                    svgDataUrl: dataUrl,
                    renderer,
                });
            }

            const svg = await response.text();
            return NextResponse.json({
                svg,
                renderer,
            });
        } catch (error) {
            errors.push(
                `${renderer} error: ${
                    error instanceof Error ? error.message : "Unknown renderer error."
                }`
            );
        }
    }

    return NextResponse.json(
        {
            error:
                errors.join(" | ") ||
                "Unable to render PlantUML diagram with the configured renderers.",
        },
        { status: 502 }
    );
}
