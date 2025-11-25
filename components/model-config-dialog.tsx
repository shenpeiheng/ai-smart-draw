"use client";

import { useEffect, useState } from "react";
import { Settings, Plus, Trash2, Check, X, Edit3 } from "lucide-react";
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
import { useModelConfig, ModelConfig } from "@/contexts/model-config-context";
import { cn } from "@/lib/utils";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

// 常用的 Base URL 预设选项
const COMMON_BASE_URLS = [
    { label: "OpenAI", value: "https://api.openai.com/v1" },
    { label: "Ollama", value: "http://localhost:11434/v1" },
    { label: "LM Studio", value: "http://localhost:1234/v1" },
    {label: "通义千问", value: "https://dashscope.aliyuncs.com/compatible-mode/v1"},
    {label: "文心一言", value: "https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat"},
    {label: "Anthropic", value: "https://api.anthropic.com/v1"},
    {label: "Google Gemini", value: "https://generativelanguage.googleapis.com/v1beta"},
    {label: "Mistral", value: "https://api.mistral.ai/v1"},
    {label: "DeepSeek", value: "https://api.deepseek.com/v1"},
    {label: "Groq", value: "https://api.groq.com/openai/v1"},
    {label: "Perplexity", value: "https://api.perplexity.ai/v1"},
    {label: "Together AI", value: "https://api.together.xyz/v1"},
    {label: "Azure OpenAI", value: "https://{your-resource-name}.openai.azure.com/openai"},
    {label: "Claude", value: "https://api.anthropic.com/v1/messages"},
    {label: "Cohere", value: "https://api.cohere.ai/v1"},
    {label: "Hugging Face", value: "https://api-inference.huggingface.co/models"},
];

export function ModelConfigDialog({
    className,
    buttonVariant = "outline",
    size = "md",
}: {
    className?: string;
    buttonVariant?: "outline" | "ghost";
    size?: "sm" | "md";
}) {
    const { configs, currentConfig, setCurrentConfig, addConfig, updateConfig, deleteConfig, switchToConfig } = useModelConfig();
    const [open, setOpen] = useState(false);
    const [draft, setDraft] = useState<ModelConfig>(currentConfig);
    const [models, setModels] = useState<string[]>([]);
    const [loadingModels, setLoadingModels] = useState(false);
    const [modelsError, setModelsError] = useState<string | null>(null);
    const [isDefaultConfig, setIsDefaultConfig] = useState(false);
    const [showUrlOptions, setShowUrlOptions] = useState(false);
    const [editingNameId, setEditingNameId] = useState<string | null>(null);
    const [editingNameValue, setEditingNameValue] = useState("");
    const [showToast, setShowToast] = useState(false);

    useEffect(() => {
        if (open) {
            setDraft(currentConfig);
            // 检查是否为默认配置（从环境变量加载的）
            setIsDefaultConfig(currentConfig.id === "default" && 
                             !currentConfig.apiKey && 
                             !currentConfig.baseUrl && 
                             !currentConfig.model);
        }
    }, [open, currentConfig]);

    const handleSave = () => {
        updateConfig(draft.id, draft);
        if (draft.id === currentConfig.id) {
            setCurrentConfig(draft);
        }
        // 显示保存成功的提示
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
        // 不再关闭对话框
    };

    const handleReset = () => {
        const resetConfig = {
            ...draft,
            apiKey: "",
            baseUrl: "",
            model: "",
            maxOutputTokens: undefined,
        };
        setDraft(resetConfig);
    };

    const handleFieldChange = <K extends keyof ModelConfig>(key: K, value: ModelConfig[K]) => {
        setDraft((prev) => ({ ...prev, [key]: value }));
    };

    const handleSwitchConfig = (configId: string) => {
        switchToConfig(configId);
    };

    const handleAddNewConfig = () => {
        const newConfig: ModelConfig = {
            id: Date.now().toString(),
            name: "新配置",
            apiKey: "",
            baseUrl: "",
            model: "",
            maxOutputTokens: undefined,
        };
        addConfig(newConfig);
        setDraft(newConfig);
        setIsDefaultConfig(false);
        // Automatically enable editing mode for the new config name
        setEditingNameId(newConfig.id);
        setEditingNameValue(newConfig.name);
    };

    const handleEditCurrentConfig = () => {
        // Enable editing mode for the current config
        setEditingNameId(draft.id);
        setEditingNameValue(draft.name);
    };

    const handleDeleteConfig = (configId: string) => {
        // 防止删除默认配置
        if (configId === "default") return;
        
        deleteConfig(configId);
        // Switch to the first config if we deleted the current one
        if (configId === draft.id && configs.length > 1) {
            const remainingConfigs = configs.filter(c => c.id !== configId);
            setDraft(remainingConfigs[0]);
            // 检查新配置是否为默认配置
            setIsDefaultConfig(remainingConfigs[0].id === "default" && 
                             !remainingConfigs[0].apiKey && 
                             !remainingConfigs[0].baseUrl && 
                             !remainingConfigs[0].model);
        }
    };

    const handleBaseUrlSelect = (value: string) => {
        handleFieldChange("baseUrl", value);
        setShowUrlOptions(false);
    };

    const saveEditingName = () => {
        if (editingNameId && editingNameValue.trim()) {
            updateConfig(editingNameId, { name: editingNameValue.trim() });
            if (editingNameId === draft.id) {
                setDraft({ ...draft, name: editingNameValue.trim() });
            }
        }
        cancelEditingName();
    };

    const cancelEditingName = () => {
        setEditingNameId(null);
        setEditingNameValue("");
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            saveEditingName();
        } else if (e.key === "Escape") {
            cancelEditingName();
        }
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
                    title="模型设置"
                    className={cn("flex items-center gap-2 h-8 px-2", className)}
                >
                    <Settings className="h-4 w-4" />
                    <span className="hidden sm:inline">模型设置</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader className="text-left">
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <Settings className="h-5 w-5 text-primary" />
                        </div>
                        模型配置
                    </DialogTitle>
                    <DialogDescription className="pt-1">
                        管理您的AI模型配置，设置将保存在本地浏览器中
                    </DialogDescription>
                </DialogHeader>

                {/* Toast notification for save confirmation */}
                {showToast && (
                    <div className="bg-green-500 text-white px-4 py-2 rounded-md shadow-lg mb-4">
                        <div className="flex items-center">
                            <Check className="h-4 w-4 mr-2" />
                            <span>配置已保存</span>
                        </div>
                    </div>
                )}

                <div className="py-2 space-y-5">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-medium text-sm">配置选择</h3>
                            <div className="flex gap-1">
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 px-2"
                                    onClick={handleEditCurrentConfig}
                                    disabled={draft.id === "default"}
                                >
                                    <Edit3 className="h-4 w-4 mr-1" />
                                    编辑
                                </Button>
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 px-2"
                                    onClick={handleAddNewConfig}
                                >
                                    <Plus className="h-4 w-4 mr-1" />
                                    新建
                                </Button>
                            </div>
                        </div>
                        
                        <div className="flex gap-2">
                            <Select value={draft.id} onValueChange={handleSwitchConfig}>
                                <SelectTrigger>
                                    <SelectValue>
                                        <div className="flex items-center justify-between w-full">
                                            <span>{draft.name}</span>
                                        </div>
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    {configs.map((config) => (
                                        <SelectItem key={config.id} value={config.id}>
                                            <div className="flex items-center justify-between w-full">
                                                <span>{config.name}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            
                            {configs.length > 1 && (
                                <Button
                                    type="button"
                                    size="icon"
                                    variant="outline"
                                    className="h-9 w-9"
                                    onClick={() => handleDeleteConfig(draft.id)}
                                    disabled={configs.length <= 1 || draft.id === "default"}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                        
                        {/* Inline editing outside of the dropdown */}
                        {editingNameId && (
                            <div className="flex items-center gap-1 p-2 border rounded-md bg-muted animate-in fade-in zoom-in-95">
                                <Input
                                    value={editingNameValue}
                                    onChange={(e) => setEditingNameValue(e.target.value)}
                                    className="h-8 px-2 text-sm flex-1"
                                    autoFocus
                                    onKeyDown={handleKeyDown}
                                />
                                <Button 
                                    size="icon" 
                                    variant="ghost" 
                                    className="h-8 w-8 p-0"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        saveEditingName();
                                    }}
                                >
                                    <Check className="h-4 w-4" />
                                </Button>
                                <Button 
                                    size="icon" 
                                    variant="ghost" 
                                    className="h-8 w-8 p-0"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        cancelEditingName();
                                    }}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-sm text-muted-foreground">API 地址</label>
                                    <div className="mt-1 flex relative">
                                        <Input
                                            value={draft.baseUrl ?? ""}
                                            placeholder="https://api.openai.com/v1"
                                            onChange={(e) => handleFieldChange("baseUrl", e.target.value)}
                                            className="rounded-r-none"
                                            disabled={isDefaultConfig}
                                        />
                                        {!isDefaultConfig && (
                                            <div className="relative">
                                                <Button 
                                                    variant="outline" 
                                                    className="rounded-l-none border-l-0 h-full px-2"
                                                    onClick={() => setShowUrlOptions(!showUrlOptions)}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <polyline points="6 9 12 15 18 9"/>
                                                    </svg>
                                                </Button>
                                                
                                                {showUrlOptions && (
                                                    <div className="absolute right-0 top-full mt-1 w-64 z-10 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                                                        <div className="p-1">
                                                            {COMMON_BASE_URLS.map((item) => (
                                                                <button
                                                                    key={item.value}
                                                                    className={cn(
                                                                        "w-full text-left text-sm px-3 py-2 hover:bg-accent rounded",
                                                                        draft.baseUrl === item.value && "bg-primary/10 text-primary"
                                                                    )}
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        e.stopPropagation();
                                                                        handleBaseUrlSelect(item.value);
                                                                    }}
                                                                >
                                                                    <div className="font-medium">{item.label}</div>
                                                                    <div className="text-xs text-muted-foreground truncate">{item.value}</div>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm text-muted-foreground">API Key</label>
                                    <Input
                                        value={draft.apiKey ?? ""}
                                        type="password"
                                        placeholder="API密钥"
                                        onChange={(e) => handleFieldChange("apiKey", e.target.value)}
                                        className="mt-1"
                                        disabled={isDefaultConfig}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-sm text-muted-foreground">模型名称</label>
                                    <Input
                                        value={draft.model ?? ""}
                                        placeholder="模型名称"
                                        onChange={(e) => handleFieldChange("model", e.target.value)}
                                        className="mt-1"
                                        disabled={isDefaultConfig}
                                    />
                                </div>

                                <div>
                                    <label className="text-sm text-muted-foreground">最大输出 Token</label>
                                    <Input
                                        type="number"
                                        min={0}
                                        step={500}
                                        value={draft.maxOutputTokens ?? ""}
                                        placeholder="最大Token数"
                                        onChange={(e) =>
                                            handleFieldChange(
                                                "maxOutputTokens",
                                                e.target.value
                                                    ? Math.max(0, Number(e.target.value))
                                                    : undefined
                                            )
                                        }
                                        className="mt-1"
                                        disabled={isDefaultConfig}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <Button
                                type="button"
                                size="sm"
                                variant="secondary"
                                onClick={fetchModels}
                                disabled={loadingModels || isDefaultConfig}
                                className="h-8 px-2"
                            >
                                {loadingModels ? "获取中..." : "获取模型"}
                            </Button>
                        </div>
                        
                        {modelsError && (
                            <p className="text-xs text-destructive">{modelsError}</p>
                        )}
                        {models.length > 0 && !isDefaultConfig && (
                            <div className="pt-1">
                                <p className="text-sm text-muted-foreground mb-2">可选模型:</p>
                                <div className="max-h-32 overflow-y-auto border rounded-md p-1 space-y-1">
                                    {models.map((m) => (
                                        <button
                                            key={m}
                                            type="button"
                                            className={cn(
                                                "w-full text-left text-sm px-3 py-2 rounded hover:bg-accent",
                                                draft.model === m && "bg-primary/10 text-primary font-medium"
                                            )}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                handleFieldChange("model", m);
                                            }}
                                        >
                                            {m}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="ghost" onClick={handleReset} className="h-8" disabled={isDefaultConfig}>
                        重置
                    </Button>
                    <Button onClick={handleSave} className="h-8" disabled={isDefaultConfig}>
                        保存配置
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}