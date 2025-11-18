"use client";

import { useEffect, useState } from "react";
import { Settings } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useModelConfig, defaultModelConfig, ModelConfig } from "@/contexts/model-config-context";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ModelConfigDialogProps {
    className?: string;
    buttonVariant?: "outline" | "ghost";
    size?: "sm" | "md";
}

export function ModelConfigDialog({
    className,
    buttonVariant = "outline",
    size = "md",
}: ModelConfigDialogProps) {
    const { config, setConfig, reset } = useModelConfig();
    const [open, setOpen] = useState(false);
    const [draft, setDraft] = useState<ModelConfig>(config);
    const [models, setModels] = useState<string[]>([]);
    const [loadingModels, setLoadingModels] = useState(false);
    const [modelsError, setModelsError] = useState<string | null>(null);

    useEffect(() => {
        if (open) {
            setDraft(config);
        }
    }, [open, config]);

    const handleSave = () => {
        setConfig(draft);
        setOpen(false);
    };

    const handleReset = () => {
        reset();
        setDraft(defaultModelConfig);
        setOpen(false);
    };

    const handleFieldChange = <K extends keyof ModelConfig>(key: K, value: ModelConfig[K]) => {
        setDraft((prev) => ({ ...prev, [key]: value }));
    };

    const smallButton = size === "sm";

    const fetchModels = async () => {
        setLoadingModels(true);
        setModelsError(null);
        try {
            const res = await fetch("/api/models", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ modelConfig: draft }),
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data?.error || "获取模型失败");
            }
            setModels(data.models ?? []);
        } catch (error) {
            setModels([]);
            setModelsError(error instanceof Error ? error.message : String(error));
        } finally {
            setLoadingModels(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant={buttonVariant}
                    size={smallButton ? "sm" : "default"}
                    className={cn("flex items-center gap-2", className)}
                >
                    <Settings className="h-4 w-4" />
                    <span>模型设置</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>模型设置（OpenAI 协议）</DialogTitle>
                    <DialogDescription>
                        保存到本地浏览器，仅当前设备可见。为空时将使用后端默认 OpenAI 环境变量。
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <label className="text-sm space-y-1">
                            <span className="block font-medium">API Key</span>
                            <Input
                                value={draft.apiKey ?? ""}
                                type="password"
                                placeholder="留空使用后端环境变量"
                                onChange={(e) => handleFieldChange("apiKey", e.target.value)}
                            />
                        </label>

                        <label className="text-sm space-y-1">
                            <span className="block font-medium">Base URL</span>
                            <Input
                                value={draft.baseUrl ?? ""}
                                placeholder="https://api.openai.com/v1"
                                onChange={(e) => handleFieldChange("baseUrl", e.target.value)}
                            />
                        </label>

                        <label className="text-sm space-y-1">
                            <span className="block font-medium">模型名</span>
                            <Input
                                value={draft.model ?? ""}
                                placeholder="gpt-4o / gpt-4o-mini"
                                onChange={(e) => handleFieldChange("model", e.target.value)}
                            />
                        </label>

                        <label className="text-sm space-y-1">
                            <span className="block font-medium">最大输出 Token</span>
                            <Input
                                type="number"
                                min={0}
                                step={500}
                                value={draft.maxOutputTokens ?? ""}
                                placeholder="默认 12000"
                                onChange={(e) =>
                                    handleFieldChange(
                                        "maxOutputTokens",
                                        e.target.value
                                            ? Math.max(0, Number(e.target.value))
                                            : undefined
                                    )
                                }
                            />
                            <span className="text-[11px] text-muted-foreground">
                                可根据模型限额调整，避免长 JSON 被截断
                            </span>
                        </label>

                        <div className="text-xs text-muted-foreground space-y-1 border rounded-md p-2">
                            <div>提示</div>
                            <ul className="list-disc pl-4 space-y-1">
                                <li>保存仅写入 localStorage，不会上传到服务器。</li>
                                <li>留空字段会回落到服务器的默认环境变量。</li>
                                <li>切换 Tab 后生效于所有聊天/制图接口。</li>
                            </ul>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-medium">快速获取可用模型</span>
                            <Button
                                type="button"
                                size="sm"
                                variant="secondary"
                                onClick={fetchModels}
                                disabled={loadingModels}
                            >
                                {loadingModels ? "获取中..." : "拉取列表"}
                            </Button>
                        </div>
                        {modelsError && (
                            <p className="text-xs text-destructive">{modelsError}</p>
                        )}
                        {models.length > 0 && (
                            <ScrollArea className="h-32 border rounded-md p-2">
                                <div className="space-y-1">
                                    {models.map((m) => (
                                        <button
                                            key={m}
                                            type="button"
                                            className={cn(
                                                "w-full text-left text-sm px-2 py-1 rounded hover:bg-accent",
                                                draft.model === m && "bg-primary/10 text-primary"
                                            )}
                                            onClick={() => handleFieldChange("model", m)}
                                        >
                                            {m}
                                        </button>
                                    ))}
                                </div>
                            </ScrollArea>
                        )}
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={handleReset}>
                        重置为空
                    </Button>
                    <Button onClick={handleSave}>保存</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
