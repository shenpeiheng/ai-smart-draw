"use client";

import { useState } from "react";
import { MermaidPreview } from "@/components/mermaid-preview";
import { MermaidDefinitionCard } from "@/components/mermaid-definition-card";
import { useMermaid } from "@/contexts/mermaid-context";
import { ResizablePanel } from "@/components/resizable-panel";

export function MermaidWorkspace() {
    const { definition, clearDefinition, setDefinition } = useMermaid();
    const [isCollapsed, setIsCollapsed] = useState(false);

    const togglePanel = () => {
        setIsCollapsed(!isCollapsed);
    };

    return (
        <div className="flex flex-col h-full gap-1">
            <div className="flex-1 min-h-0">
                <MermaidPreview
                    definition={definition}
                    className="h-full"
                />
            </div>
            <ResizablePanel 
                defaultHeight={208}
                isCollapsed={isCollapsed}
                onToggle={togglePanel}
            >
                <MermaidDefinitionCard
                    definition={definition}
                    onDefinitionChange={setDefinition}
                    onReset={clearDefinition}
                    isCollapsed={isCollapsed}
                    onToggle={togglePanel}
                />
            </ResizablePanel>
        </div>
    );
}