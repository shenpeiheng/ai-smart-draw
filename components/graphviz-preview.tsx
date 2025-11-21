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
    Download,
    CheckIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useGraphviz } from "@/contexts/graphviz-context";

const RENDER_DEBOUNCE_MS = 500;

export function GraphvizPreview() {
    const { definition } = useGraphviz();
    const [copied, setCopied] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [svgMarkup, setSvgMarkup] = useState<string>("");
    const [rendererLabel] = useState<string | null>("kroki.io");
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
            setLoadError("Provide Graphviz text to render a preview.");
            setIsLoading(false);
            return;
        }

        const controller = new AbortController();
        setIsLoading(true);
        setLoadError(null);

        // Use the internal API endpoint like other preview components
        fetch("/api/kroki/render", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ 
                definition: debouncedDefinition,
                diagramType: "graphviz"
            }),
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
                setLoadError(null);
            })
            .catch((error) => {
                if (controller.signal.aborted) return;
                setSvgMarkup("");
                setLoadError(
                    error instanceof Error
                        ? error.message
                        : "Unable to load diagram."
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

    const handleCopy = () => {
        navigator.clipboard.writeText(definition);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        if (!svgMarkup) return;
        
        let blob;
        let filename;
        
        if (svgMarkup.startsWith("data:")) {
            // Handle data URL
            const parts = svgMarkup.split(',');
            const mimeType = parts[0].match(/:(.*?);/)?.[1] || "image/svg+xml";
            const decodedData = atob(parts[1]);
            blob = new Blob([decodedData], { type: mimeType });
            filename = `graphviz-diagram.${mimeType.split('/')[1] || 'svg'}`;
        } else {
            // Handle raw SVG string
            blob = new Blob([svgMarkup], { type: "image/svg+xml" });
            filename = "graphviz-diagram.svg";
        }
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleRetry = () => {
        setRetryNonce((value) => value + 1);
    };

    const zoomIn = () => setZoom(prev => Math.min(prev * 1.2, 3));
    const zoomOut = () => setZoom(prev => Math.max(prev / 1.2, 0.75));
    const resetZoom = () => setZoom(1);

    const previewContent = useMemo(() => {
        if (loadError) {
            return (
                <div className="flex flex-col items-center justify-center text-center text-sm text-muted-foreground gap-3 p-4">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    <div className="space-y-1">
                        <p className="font-medium text-red-600">Rendering failed</p>
                        <p className="text-xs">{loadError}</p>
                    </div>
                    <Button size="sm" variant="secondary" onClick={handleRetry}>
                        <RefreshCcw className="h-3 w-3 mr-1" />
                        Retry
                    </Button>
                </div>
            );
        }

        if (isLoading) {
            return (
                <div className="flex flex-col items-center justify-center text-center text-sm text-muted-foreground gap-3 p-4">
                    <LoaderCircle className="h-5 w-5 animate-spin" />
                    <p>Rendering diagram...</p>
                </div>
            );
        }

        if (!svgMarkup) {
            return (
                <div className="flex items-center justify-center text-sm text-muted-foreground p-4">
                    Enter Graphviz code to see a preview
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
                        alt="Graphviz preview"
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
    }, [loadError, svgMarkup, isLoading, zoom]);

    return (
        <div className="flex flex-col h-full bg-white rounded-lg border shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/50">
                <div>
                    <p className="text-sm font-medium">Graphviz 预览</p>
                    <p className="text-xs text-muted-foreground">
                        由 https://kroki.io/ 提供支持
                    </p>
                </div>
                <div className="flex gap-2 flex-wrap justify-end items-center">
                    <Button variant="outline" title="复制" size="sm" onClick={handleCopy}>
                        {copied ? <CheckIcon className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                    <Button variant="outline" title="重置" size="sm" onClick={resetZoom}>
                        <RefreshCcw className="h-4 w-4" />
                    </Button>
                    <div className="flex rounded-md overflow-hidden border border-input shadow-sm">
                        <Button variant="outline" title="放小" size="sm" onClick={zoomOut} className="rounded-none border-0 px-3">
                            <ZoomOut className="h-4 w-4" />
                        </Button>
                        <span className="flex items-center justify-center text-xs w-16 bg-background">
                            {Math.round(zoom * 100)}%
                        </span>
                        <Button variant="outline" title="放大" size="sm" onClick={zoomIn} className="rounded-none border-0 px-3">
                            <ZoomIn className="h-4 w-4" />
                        </Button>
                    </div>
                    <Button variant="outline" title="下载" size="sm" onClick={handleDownload} disabled={!svgMarkup}>
                        <Download className="h-4 w-4" />
                    </Button>
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