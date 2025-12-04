import pako from "pako";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

// Default to kroki.io
const DEFAULT_RENDERER = process.env.KROKI_RENDER_BASE?.replace(/\/$/, "") || "http://vg.007988.xyz:8000";

// Supported diagram types and their endpoints
// Reference: https://kroki.io/#support
const DIAGRAM_TYPES: Record<string, string> = {
    "actdiag": "actdiag",
    "blockdiag": "blockdiag",
    "bpmn": "bpmn",
    "bytefield": "bytefield",
    "c4plantuml": "c4plantuml",
    "ditaa": "ditaa",
    "erd": "erd",
    "excalidraw": "excalidraw",
    "graphviz": "graphviz",
    "mermaid": "mermaid",
    "nomnoml": "nomnoml",
    "nwdiag": "nwdiag",
    "packetdiag": "packetdiag",
    "pikchr": "pikchr",
    "plantuml": "plantuml",
    "rackdiag": "rackdiag",
    "seqdiag": "seqdiag",
    "structurizr": "structurizr",
    "svgbob": "svgbob",
    "umlet": "umlet",
    "vega": "vega",
    "d2": "d2",
    "dbml": "dbml",
    "tikz": "tikz",
    "vegalite": "vegalite",
    "wavedrom": "wavedrom",
    "wireviz": "wireviz",
    "symbolator": "symbolator",
};

function detectDiagramType(definition: string): string {
    const trimmed = definition.trim().toLowerCase();
    
    // First check if the definition starts with an explicit diagram type marker
    for (const [marker, type] of Object.entries(DIAGRAM_TYPES)) {
        const directMarker = marker.toLowerCase();
        if (trimmed.startsWith(directMarker)) {
            // Skip the marker line and any empty lines after it when determining the actual diagram type
            const lines = definition.trim().split('\n');
            let startIndex = 1; // Skip the first line which is the marker
            while (startIndex < lines.length && lines[startIndex].trim() === '') {
                startIndex++; // Skip empty lines after marker
            }
            
            // If we have content after the marker, use that to determine the real type
            if (startIndex < lines.length) {
                const contentAfterMarker = lines.slice(startIndex).join('\n');
                return detectActualDiagramType(contentAfterMarker, type);
            }
            
            // If no content after marker, return the marker type
            return type;
        }
    }
    
    // If no explicit marker, try to detect from content
    return detectActualDiagramType(definition, "plantuml");
}

function detectActualDiagramType(definition: string, defaultType: string): string {
    const trimmed = definition.trim();
    if (!trimmed) return defaultType;
    
    // Check for specific content patterns to identify diagram types
    if (trimmed.includes('@startuml') || trimmed.includes('skinparam')) {
        return "plantuml";
    }
    if (trimmed.includes('graph ') && (trimmed.includes('{') || trimmed.includes('->'))) {
        return "graphviz";
    }
    if (trimmed.includes('graph') && trimmed.includes('TD') || trimmed.includes('LR') || trimmed.includes('BT') || trimmed.includes('RL')) {
        return "mermaid";
    }
    if (trimmed.includes('blockdiag') || trimmed.includes('->') && trimmed.includes(';') && !trimmed.includes('@startuml')) {
        return "blockdiag";
    }
    if (trimmed.includes('seqdiag') && trimmed.includes('->')) {
        return "seqdiag";
    }
    if (trimmed.includes('actdiag')) {
        return "actdiag";
    }
    if (trimmed.includes('nwdiag')) {
        return "nwdiag";
    }
    if (trimmed.includes('packetdiag')) {
        return "packetdiag";
    }
    if (trimmed.includes('rackdiag')) {
        return "rackdiag";
    }
    if (trimmed.includes('bytefield') || trimmed.includes('(defattrs') || trimmed.includes('(defn') || trimmed.includes('draw-box')) {
        return "bytefield";
    }
    if (trimmed.includes('<?xml') && trimmed.includes('semantic:definitions')) {
        return "bpmn";
    }
    if (trimmed.includes('|') && trimmed.includes('--') && trimmed.includes('==') && !trimmed.includes('{')) {
        return "erd";
    }
    if (trimmed.includes('d2 Parser') || trimmed.includes('shape:') || (trimmed.includes(':') && trimmed.includes('{') && trimmed.includes('}'))) {
        return "d2";
    }
    
    // Default to the provided default type if no specific patterns are found
    return defaultType;
}

function encodeDiagram(definition: string): string {
    // Encode in deflate + base64 format as expected by Kroki
    try {
        const buffer = Buffer.from(definition, 'utf8');
        const compressed = pako.deflate(buffer);
        return Buffer.from(compressed).toString('base64').replace(/\+/g, '-').replace(/\//g, '_');
    } catch (error) {
        // Fallback to simple base64 encoding
        return Buffer.from(definition, 'utf8').toString('base64').replace(/\+/g, '-').replace(/\//g, '_');
    }
}

export async function POST(request: NextRequest) {
    let definition: string | undefined;
    let diagramType: string | undefined;

    try {
        const body = await request.json();
        definition = body?.definition;
        diagramType = body?.diagramType;
    } catch {
        return NextResponse.json(
            {error: "Invalid request body. Expected JSON with a definition field."},
            {status: 400}
        );
    }

    if (!definition || !definition.trim()) {
        return NextResponse.json(
            {error: "Diagram definition cannot be empty."},
            {status: 400}
        );
    }

    // Use provided diagram type or auto-detect if not specified or set to "auto"
    const finalDiagramType = (diagramType && diagramType !== "auto")
        ? diagramType
        : detectDiagramType(definition);

    const encoded = encodeDiagram(definition);
    const renderer = DEFAULT_RENDERER;
    const url = `${renderer}/${finalDiagramType}/svg/${encoded}`;

    // Also try the text format which might be more reliable
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'image/svg+xml',
            },
            cache: "no-store",
        });

        if (!response.ok) {
            return NextResponse.json(
                {
                    error: `Kroki service responded with ${response.status} ${response.statusText || ""}`.trim()
                },
                {status: response.status}
            );
        }

        const contentType = response.headers.get("content-type") ?? "image/svg+xml";
        if (!contentType.includes("svg")) {
            const buffer = Buffer.from(await response.arrayBuffer());
            const dataUrl = `data:${contentType};base64,${buffer.toString("base64")}`;
            return NextResponse.json({
                svgDataUrl: dataUrl,
                renderer: "kroki.io",
            });
        }

        const svg = await response.text();
        return NextResponse.json({
            svg,
            renderer: "kroki.io",
        });
    } catch (error) {
        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : "Unknown error contacting Kroki service."
            },
            {status: 502}
        );
    }
}