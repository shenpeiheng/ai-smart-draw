"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ClipboardCopy, ClipboardCheck, RefreshCcw, ChevronsDown, ChevronsUp } from "lucide-react";
import { copyToClipboard } from "@/components/plantuml-definition-card";

interface GraphvizDefinitionCardProps {
    definition: string;
    onChange: (value: string) => void;
    onClear: () => void;
    defaultDefinition: string;
    isCollapsed?: boolean;
    onToggle?: () => void;
}

export function GraphvizDefinitionCard({
    definition,
    onChange,
    onClear,
    defaultDefinition,
    isCollapsed,
    onToggle,
}: GraphvizDefinitionCardProps) {
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!copied) return;
        const timer = setTimeout(() => setCopied(false), 1500);
        return () => clearTimeout(timer);
    }, [copied]);

    const handleCopy = async () => {
        if (!definition) return;
        await copyToClipboard(definition);
        setCopied(true);
    };

    const handleReset = () => {
        onChange(defaultDefinition);
    };

    return (
        <div className="bg-white rounded-lg border shadow-sm flex flex-col h-full">
            <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/40">
                <div>
                    <p className="text-sm font-medium">Graphviz 定义</p>
                    <p className="text-xs text-muted-foreground">
                        调整代码进行实时预览
                    </p>
                </div>
                <div className="flex gap-1 items-center">
                    {onToggle && (
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={onToggle}
                            title="折叠"
                            aria-label={isCollapsed ? "Expand panel" : "Collapse panel"}
                        >
                            {isCollapsed ? (
                                <ChevronsUp className="h-4 w-4" />
                            ) : (
                                <ChevronsDown className="h-4 w-4" />
                            )}
                        </Button>
                    )}
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleReset}
                        title="重置"
                    >
                        <RefreshCcw className="h-4 w-4" />
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleCopy}
                        title="复制"
                        disabled={!definition}
                    >
                        {copied ? (
                            <ClipboardCheck className="h-4 w-4" />
                        ) : (
                            <ClipboardCopy className="h-4 w-4" />
                        )}
                    </Button>
                </div>
            </div>
            {!isCollapsed && (
                <div className="flex-1 bg-muted/10 flex flex-col overflow-hidden">
                    <Textarea
                        value={definition}
                        onChange={(event) => onChange(event.target.value)}
                        placeholder="Enter Graphviz definition (digraph, graph, etc.)..."
                        className="flex-1 min-h-0 text-xs resize-none bg-white/70 focus-visible:ring-2 overflow-auto font-mono"
                        spellCheck={false}
                    />
                </div>
            )}
        </div>
    );
}