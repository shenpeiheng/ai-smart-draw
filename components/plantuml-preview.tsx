"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Copy,
    RefreshCcw,
    AlertCircle,
    LoaderCircle,
    ZoomIn,
    ZoomOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PlantUMLPreviewProps {
    definition: string;
}

const RENDER_DEBOUNCE_MS = 500;

export function PlantUMLPreview({ definition }: PlantUMLPreviewProps) {
    const [copied, setCopied] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [svgMarkup, setSvgMarkup] = useState<string>("");
    const [rendererLabel, setRendererLabel] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [retryNonce, setRetryNonce] = useState(0);
    const [debouncedDefinition, setDebouncedDefinition] = useState(definition);
    const [zoom, setZoom] = useState(1);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedDefinition(definition);
        }, RENDER_DEBOUNCE_MS);

        return () => clearTimeout(timer);
    }, [definition]);

    useEffect(() => {
        if (!debouncedDefinition.trim()) {
            setSvgMarkup("");
            setRendererLabel(null);
            setLoadError("Provide PlantUML text to render a preview.");
            setIsLoading(false);
            return;
        }

        const controller = new AbortController();
        setIsLoading(true);
        setLoadError(null);
        setRendererLabel(null);

        fetch("/api/plantuml/render", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ definition: debouncedDefinition }),
            signal: controller.signal,
        })
            .then(async (response) => {
                const payload = await response.json().catch(() => null);
                if (!response.ok) {
                    throw new Error(
                        payload?.error ||
                            `Renderer error (${response.status} ${response.statusText})`
                    );
                }
                setSvgMarkup(payload?.svg ?? payload?.svgDataUrl ?? "");
                setRendererLabel(payload?.renderer ?? null);
                setLoadError(null);
            })
            .catch((error) => {
                if (controller.signal.aborted) return;
                setSvgMarkup("");
                setLoadError(
                    error instanceof Error
                        ? error.message
                        : "Unable to load PlantUML diagram."
                );
            })
            .finally(() => {
                if (!controller.signal.aborted) {
                    setIsLoading(false);
                }
            });

        return () => {
            controller.abort();
        };
    }, [debouncedDefinition, retryNonce]);

    useEffect(() => {
        if (!copied) return;
        const timer = setTimeout(() => setCopied(false), 2000);
        return () => clearTimeout(timer);
    }, [copied]);

    const handleRetry = () => {
        setRetryNonce((value) => value + 1);
    };

    const zoomIn = () => setZoom((z) => Math.min(z + 0.1, 3));
    const zoomOut = () => setZoom((z) => Math.max(z - 0.1, 0.3));
    const resetZoom = () => setZoom(1);

    const previewContent = useMemo(() => {
        if (loadError) {
            return (
                <div className="flex flex-col items-center justify-center text-center text-sm text-muted-foreground gap-3 p-4">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    <div className="space-y-1">
                        <p className="font-medium text-red-600">
                            Unable to render PlantUML.
                        </p>
                        <p>{loadError}</p>
                        <p className="text-xs">
                            Ensure the PlantUML renderer (plantuml.com, kroki.io, or a custom
                            server) is reachable. Configure `PLANTUML_RENDER_BASE` to point to
                            an internal endpoint if needed.
                        </p>
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleRetry}
                    >
                        Retry
                    </Button>
                </div>
            );
        }

        if (!svgMarkup) {
            return (
                <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                    Provide PlantUML text to render a preview.
                </div>
            );
        }

        if (svgMarkup.startsWith("data:")) {
            return (
                <div
                    className="flex justify-center"
                    style={{ transform: `scale(${zoom})`, transformOrigin: "top center" }}
                >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={svgMarkup}
                        alt="PlantUML preview"
                        className="max-w-full"
                        loading="lazy"
                    />
                </div>
            );
        }

        return (
            <div
                className="flex justify-center"
                style={{ transform: `scale(${zoom})`, transformOrigin: "top center" }}
                dangerouslySetInnerHTML={{ __html: svgMarkup }}
            />
        );
    }, [loadError, svgMarkup, zoom]);

    return (
        <div className="flex flex-col h-full bg-white rounded-lg border shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/50">
                <div>
                    <p className="text-sm font-medium">PlantUML 预览</p>
                    <p className="text-xs text-muted-foreground">
                        当前 {rendererLabel ?? "使用默认渲染器"}
                    </p>
                </div>
                <div className="flex gap-2 flex-wrap justify-end">
                    <div className="flex gap-1">
                        <Button variant="outline" size="sm" onClick={zoomOut}>
                            <ZoomOut className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={resetZoom}>
                            <RefreshCcw className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={zoomIn}>
                            <ZoomIn className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
            <div className="flex-1 p-4 bg-white overflow-auto relative">
                <div
                    className={cn(
                        "absolute inset-x-4 top-4 flex items-center gap-2 text-xs text-muted-foreground transition-opacity pointer-events-none",
                        isLoading ? "opacity-100" : "opacity-0"
                    )}
                >
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                    <span>Rendering diagram...</span>
                </div>
                <div className={cn(isLoading && "opacity-50 pointer-events-none")}>
                    {previewContent}
                </div>
            </div>
        </div>
    );
}
