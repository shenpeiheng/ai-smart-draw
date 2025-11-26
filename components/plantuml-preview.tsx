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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { exportSVGAs, downloadBlob } from "@/lib/export-utils";

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
    const [isResetting, setIsResetting] = useState(false);
    const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);

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
    
    const resetZoom = () => {
        setIsResetting(true);
        setZoom(1);
        // 添加一个短暂的延迟来显示重置动画效果
        setTimeout(() => setIsResetting(false), 300);
    };

    const handleDownload = async (format: 'png' | 'jpeg' | 'svg' | 'pdf') => {
        if (!svgMarkup) return;
        
        try {
            console.log(`Exporting PlantUML as ${format}:`, svgMarkup.substring(0, 200) + '...');
            
            let blob: Blob;
            let filename: string;
            
            if (svgMarkup.startsWith("data:")) {
                // Handle data URL
                const parts = svgMarkup.split(',');
                const mimeType = parts[0].match(/:(.*?);/)?.[1] || "image/svg+xml";
                const decodedData = atob(parts[1]);
                const svgString = decodedData;
                
                if (format === 'svg') {
                    blob = new Blob([svgString], { type: mimeType });
                    filename = `plantuml-diagram.${format}`;
                } else {
                    blob = await exportSVGAs(svgString, { format, quality: 0.9, scale: 2 });
                    filename = `plantuml-diagram.${format}`;
                }
            } else {
                // Handle raw SVG string
                if (format === 'svg') {
                    blob = new Blob([svgMarkup], { type: "image/svg+xml" });
                    filename = "plantuml-diagram.svg";
                } else {
                    blob = await exportSVGAs(svgMarkup, { format, quality: 0.9, scale: 2 });
                    filename = `plantuml-diagram.${format}`;
                }
            }
            
            downloadBlob(blob, filename);
            setIsExportMenuOpen(false);
        } catch (error) {
            console.error(`Failed to export PlantUML as ${format}:`, error);
            setLoadError(`导出失败: ${error instanceof Error ? error.message : '未知错误'}`);
        }
    };

    // Close export menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (isExportMenuOpen && !target.closest('.export-menu-container')) {
                setIsExportMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isExportMenuOpen]);

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
                        由 <a href=" https://www.plantuml.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline"> https://www.plantuml.com</a> 提供支持
                    </p>
                </div>
                <div className="flex gap-2 flex-wrap justify-end items-center">
                    <Button 
                        variant="outline" 
                        title="重置" 
                        size="sm" 
                        onClick={resetZoom}
                        className={cn(
                            "transition-all duration-300",
                            isResetting && "bg-blue-500 text-white border-blue-500"
                        )}
                    >
                        <RefreshCcw className={cn(
                            "h-4 w-4",
                            isResetting && "animate-spin"
                        )} />
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
                    <div className="relative export-menu-container">
                        <Button 
                            variant="outline" 
                            title="导出" 
                            size="sm" 
                            onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                            disabled={!svgMarkup}
                        >
                            <Download className="h-4 w-4" />
                        </Button>
                        
                        {isExportMenuOpen && (
                            <div className="absolute right-0 mt-1 w-32 bg-white border rounded-md shadow-lg z-10">
                                <button
                                    className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                                    onClick={() => {
                                        handleDownload('png');
                                    }}
                                >
                                    PNG
                                </button>
                                <button
                                    className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                                    onClick={() => {
                                        handleDownload('jpeg');
                                    }}
                                >
                                    JPEG
                                </button>
                                <button
                                    className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                                    onClick={() => {
                                        handleDownload('svg');
                                    }}
                                >
                                    SVG
                                </button>
                            </div>
                        )}
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