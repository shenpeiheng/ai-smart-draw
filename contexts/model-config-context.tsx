"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export interface ModelConfig {
    id: string;
    name: string;
    apiKey?: string;
    baseUrl?: string;
    model?: string;
    maxOutputTokens?: number;
}

interface ModelConfigContextValue {
    configs: ModelConfig[];
    currentConfig: ModelConfig;
    setCurrentConfig: (value: ModelConfig) => void;
    addConfig: (value: ModelConfig) => void;
    updateConfig: (id: string, value: Partial<ModelConfig>) => void;
    deleteConfig: (id: string) => void;
    switchToConfig: (id: string) => void;
    reset: () => void;
}

const STORAGE_KEY = "ai-model-configs";
const CURRENT_CONFIG_KEY = "ai-current-model-config";

export const defaultModelConfig: ModelConfig = {
    id: "default",
    name: "默认配置",
    apiKey: "",
    baseUrl: "",
    model: "",
    maxOutputTokens: undefined,
};

const ModelConfigContext = createContext<ModelConfigContextValue | undefined>(undefined);

export function ModelConfigProvider({ children }: { children: React.ReactNode }) {
    const [configs, setConfigs] = useState<ModelConfig[]>([defaultModelConfig]);
    const [currentConfig, setCurrentConfig] = useState<ModelConfig>(defaultModelConfig);

    // Load from localStorage on mount
    useEffect(() => {
        try {
            const storedConfigs = localStorage.getItem(STORAGE_KEY);
            const storedCurrentConfig = localStorage.getItem(CURRENT_CONFIG_KEY);
            
            if (storedConfigs) {
                const parsedConfigs = JSON.parse(storedConfigs) as ModelConfig[];
                setConfigs(parsedConfigs);
            }
            
            if (storedCurrentConfig) {
                const parsedCurrentConfig = JSON.parse(storedCurrentConfig) as ModelConfig;
                setCurrentConfig(parsedCurrentConfig);
            }
        } catch (error) {
            console.warn("Failed to load model configs from storage", error);
        }
    }, []);

    // Persist to localStorage whenever configs or currentConfig changes
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(configs));
            localStorage.setItem(CURRENT_CONFIG_KEY, JSON.stringify(currentConfig));
        } catch (error) {
            console.warn("Failed to save model configs to storage", error);
        }
    }, [configs, currentConfig]);

    const addConfig = (config: ModelConfig) => {
        const newConfigs = [...configs, config];
        setConfigs(newConfigs);
    };

    const updateConfig = (id: string, updates: Partial<ModelConfig>) => {
        const newConfigs = configs.map(config => 
            config.id === id ? { ...config, ...updates } : config
        );
        setConfigs(newConfigs);
        
        // If we're updating the current config, update it
        if (currentConfig.id === id) {
            setCurrentConfig({ ...currentConfig, ...updates });
        }
    };

    const deleteConfig = (id: string) => {
        // Prevent deleting the last config
        if (configs.length <= 1) return;
        
        const newConfigs = configs.filter(config => config.id !== id);
        setConfigs(newConfigs);
        
        // If we're deleting the current config, switch to the first one
        if (currentConfig.id === id) {
            setCurrentConfig(newConfigs[0]);
        }
    };

    const switchToConfig = (id: string) => {
        const config = configs.find(c => c.id === id);
        if (config) {
            setCurrentConfig(config);
        }
    };

    const reset = () => {
        setConfigs([defaultModelConfig]);
        setCurrentConfig(defaultModelConfig);
    };

    const value = useMemo<ModelConfigContextValue>(
        () => ({
            configs,
            currentConfig,
            setCurrentConfig,
            addConfig,
            updateConfig,
            deleteConfig,
            switchToConfig,
            reset,
        }),
        [configs, currentConfig]
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