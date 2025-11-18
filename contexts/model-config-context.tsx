"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export interface ModelConfig {
    apiKey?: string;
    baseUrl?: string;
    model?: string;
    maxOutputTokens?: number;
}

interface ModelConfigContextValue {
    config: ModelConfig;
    setConfig: (value: ModelConfig) => void;
    updateConfig: (value: Partial<ModelConfig>) => void;
    reset: () => void;
}

const STORAGE_KEY = "ai-model-config";

export const defaultModelConfig: ModelConfig = {
    apiKey: "",
    baseUrl: "",
    model: "",
    maxOutputTokens: undefined,
};

const ModelConfigContext = createContext<ModelConfigContextValue | undefined>(undefined);

export function ModelConfigProvider({ children }: { children: React.ReactNode }) {
    const [config, setConfig] = useState<ModelConfig>(defaultModelConfig);

    // Load from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored) as ModelConfig;
                setConfig({
                    ...defaultModelConfig,
                    ...parsed,
                });
            }
        } catch (error) {
            console.warn("Failed to load model config from storage", error);
        }
    }, []);

    // Persist to localStorage whenever config changes
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
        } catch (error) {
            console.warn("Failed to save model config to storage", error);
        }
    }, [config]);

    const value = useMemo<ModelConfigContextValue>(
        () => ({
            config,
            setConfig,
            updateConfig: (value) => setConfig((prev) => ({ ...prev, ...value })),
            reset: () => setConfig(defaultModelConfig),
        }),
        [config]
    );

    return (
        <ModelConfigContext.Provider value={value}>
            {children}
        </ModelConfigContext.Provider>
    );
}

export function useModelConfig() {
    const ctx = useContext(ModelConfigContext);
    if (!ctx) {
        throw new Error("useModelConfig must be used within a ModelConfigProvider");
    }
    return ctx;
}
