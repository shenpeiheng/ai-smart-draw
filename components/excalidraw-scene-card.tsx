"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {ClipboardCopy, ClipboardCheck, RefreshCcw} from "lucide-react";
import { useExcalidraw } from "@/contexts/excalidraw-context";
import {copyToClipboard} from "@/components/plantuml-definition-card";

interface Props {
    onClear: () => void;
    onHistory: () => void;
    historyDisabled?: boolean;
}

export function ExcalidrawSceneCard({ onClear, onHistory, historyDisabled }: Props) {
    const { sceneData, sceneDraft, setSceneDraft, applyScene } = useExcalidraw();
    const [draft, setDraft] = useState(sceneDraft ?? sceneData);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        setDraft(sceneDraft ?? sceneData);
    }, [sceneData, sceneDraft]);

    useEffect(() => {
        if (!copied) return;
        const timer = setTimeout(() => setCopied(false), 1500);
        return () => clearTimeout(timer);
    }, [copied]);

    const handleApply = () => {
        try {
            JSON.parse(draft);
            applyScene(draft, "手动编辑");
            setError(null);
            setSceneDraft(null);
        } catch (e) {
            setError(e instanceof Error ? e.message : String(e));
        }
    };

    const handleFormat = () => {
        try {
            const formatted = JSON.stringify(JSON.parse(draft), null, 2);
            setDraft(formatted);
            setError(null);
            setSceneDraft(formatted);
        } catch (e) {
            setError(e instanceof Error ? e.message : String(e));
        }
    };

    const handleCopy = async () => {
        if (!draft) return;
        try {
            await copyToClipboard(draft);
            setCopied(true);
        } catch (e) {
            console.warn("Copy failed", e);
        }
    };

    return (
        <div className="bg-white rounded-lg border shadow-sm flex flex-col h-full">
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2 border-b bg-muted/50">
                <div>
                    <p className="text-sm font-medium">Excalidraw 场景 JSON</p>
                    <p className="text-xs text-muted-foreground">
                        可直接编辑 JSON，点击“应用”刷新上方画布
                    </p>
                </div>
                <div className="flex gap-2 flex-wrap">
                    <Button type="button" size="sm" variant="outline" onClick={onClear}>
                        <RefreshCcw className="h-4 w-4 mr-2" />
                        重置
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={onHistory}
                        disabled={historyDisabled}
                    >
                        <ClipboardCheck className="h-4 w-4 mr-2" />
                        历史记录
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={handleCopy}
                        disabled={!draft}
                    >
                        {copied ? (
                            <ClipboardCheck className="h-4 w-4 mr-2" />
                        ) : (
                            <ClipboardCopy className="h-4 w-4 mr-2" />
                        )}
                        {copied ? "已复制" : "复制"}
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={handleFormat}
                    >
                        格式化
                    </Button>
                    <Button type="button" size="sm" onClick={handleApply}>
                        应用
                    </Button>
                </div>
            </div>
            <div className="flex-1 p-1 bg-muted/10 flex flex-col gap-2 overflow-hidden">
                <Textarea
                    value={draft}
                    onChange={(event) => {
                        setDraft(event.target.value);
                        setSceneDraft(event.target.value);
                    }}
                    spellCheck={false}
                    className="flex-1 min-h-0 text-xs font-mono resize-none bg-white/80 focus-visible:ring-2 overflow-auto"
                    placeholder="粘贴或编辑 Excalidraw 场景 JSON..."
                />
                {error && (
                    <p className="text-xs text-destructive">
                        解析失败：{error}
                    </p>
                )}
                <p className="text-[11px] text-muted-foreground">
                    提示：保持 elements / appState / files 三个字段完整可提高生成成功率。
                </p>
            </div>
        </div>
    );
}

