"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ClipboardCopy, ClipboardCheck, RefreshCcw } from "lucide-react";
import {copyToClipboard} from "@/components/plantuml-definition-card";

interface MermaidDefinitionCardProps {
    definition: string;
    onDefinitionChange?: (definition: string) => void;
    onReset?: () => void;
}

export function MermaidDefinitionCard({
    definition,
    onDefinitionChange,
    onReset,
}: MermaidDefinitionCardProps) {
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

    return (
        <div className="bg-white rounded-lg border shadow-sm flex flex-col h-full">
            <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/40">
                <div>
                    <p className="text-sm font-medium">Mermaid 定义</p>
                    <p className="text-xs text-muted-foreground">
                        编辑以下代码以调整实时预览。
                    </p>
                </div>
                <div className="flex gap-2">
                    {onReset && (
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={onReset}
                        >
                            <RefreshCcw className="h-4 w-4 mr-2" />
                            重置
                        </Button>
                    )}
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleCopy}
                        disabled={!definition}
                    >
                        {copied ? (
                            <ClipboardCheck className="h-4 w-4 mr-2" />
                        ) : (
                            <ClipboardCopy className="h-4 w-4 mr-2" />
                        )}
                        {copied ? "已复制" : "复制"}
                    </Button>
                </div>
            </div>
            <div className="flex-1 p-1 bg-muted/10 flex flex-col gap-2 overflow-hidden">
                <Textarea
                    value={definition}
                    onChange={(event) => onDefinitionChange?.(event.target.value)}
                    placeholder="Ask the assistant for a diagram or type Mermaid markup directly..."
                    className="flex-1 min-h-0 text-xs resize-none bg-white/70 focus-visible:ring-2 overflow-auto"
                    spellCheck={false}
                    disabled={!onDefinitionChange}
                />
                <p className="text-[11px] text-muted-foreground">
                    更改会即时同步到上方的渲染器中。
                </p>
            </div>
        </div>
    );
}
