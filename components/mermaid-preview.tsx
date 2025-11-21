"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, RefreshCcw, Download } from "lucide-react";
import { cn } from "@/lib/utils";

interface MermaidPreviewProps {
    definition: string;
    className?: string;
}

export function MermaidPreview({
    definition,
    className,
}: MermaidPreviewProps) {
    const [mermaidAPI, setMermaidAPI] = useState<any>(null);
    const [svg, setSvg] = useState<string>("");
    const [renderError, setRenderError] = useState<string | null>(null);

    const [zoom, setZoom] = useState(1);

    const diagramId = useMemo(
        () => `mermaid-${Math.random().toString(36).slice(2, 10)}`,
        []
    );

    useEffect(() => {
        let isMounted = true;
        import("mermaid")
            .then((module) => {
                if (!isMounted) return;
                const instance = (module as any)?.default ?? module;
                instance.initialize({
                    startOnLoad: false,
                    securityLevel: "loose",
                    theme: "neutral",
                });
                setMermaidAPI(instance);
            })
            .catch((error) => {
                console.error("Failed to load Mermaid:", error);
                if (isMounted) {
                    setRenderError("Mermaid 渲染器加载失败");
                }
            });

        return () => {
            isMounted = false;
        };
    }, []);

    useEffect(() => {
        if (!mermaidAPI) return;
        if (!definition.trim()) {
            setSvg("");
            setRenderError("等待 Mermaid 内容…");
            return;
        }

        let cancelled = false;

        // 使用 setTimeout 确保定义完全加载后再渲染
        const timer = setTimeout(() => {
            mermaidAPI
                .render(diagramId, definition)
                .then(({ svg }: { svg: string }) => {
                    if (!cancelled) {
                        setSvg(svg);
                        setRenderError(null);
                    }
                })
                .catch((error: unknown) => {
                    console.error("Mermaid render error:", error);
                    if (!cancelled) {
                        setRenderError(
                            error instanceof Error
                                ? error.message
                                : "无法渲染 Mermaid 图。"
                        );
                    }
                });
        }, 500); // 延迟 500ms 确保定义完全加载

        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, [definition, mermaidAPI, diagramId]);

    const zoomIn = () => setZoom((z) => Math.min(z + 0.1, 3));
    const zoomOut = () => setZoom((z) => Math.max(z - 0.1, 0.3));
    const resetZoom = () => setZoom(1);

    const handleDownload = () => {
        if (!svg) return;
        
        const blob = new Blob([svg], { type: "image/svg+xml" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `mermaid-diagram-${diagramId}.svg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div
            className={cn(
                "flex flex-col h-full bg-white rounded-lg border shadow-sm overflow-hidden",
                className
            )}
        >
            <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/40">
                <div>
                    <p className="text-sm font-medium">Mermaid 预览</p>
                    <p className="text-xs text-muted-foreground">
                        AI 回复实时渲染
                    </p>
                </div>
                <div className="flex gap-2 flex-wrap justify-end items-center">
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
                    <Button variant="outline" title="下载" size="sm" onClick={handleDownload} disabled={!svg}>
                        <Download className="h-4 w-4" />
                    </Button>
                </div>

            </div>

            <div className="flex-1 overflow-auto p-4 bg-white">
                {renderError ? (
                    <div className="h-full flex items-center justify-center text-red-500 text-sm text-center px-4">
                        {renderError}
                    </div>
                ) : svg ? (
                    <div
                        className="flex justify-center"
                        style={{
                            transform: `scale(${zoom})`,
                            transformOrigin: "top center",
                        }}
                        dangerouslySetInnerHTML={{ __html: svg }}
                    />
                ) : (
                    <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                        Preparing preview...
                    </div>
                )}
            </div>
        </div>
    );
}