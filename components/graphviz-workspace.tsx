"use client";

import { useState } from "react";
import { GraphvizPreview } from "@/components/graphviz-preview";
import { useGraphviz } from "@/contexts/graphviz-context";
import { GraphvizDefinitionCard } from "@/components/graphviz-definition-card";
import { ResizablePanel } from "@/components/resizable-panel";

export function GraphvizWorkspace() {
    const { definition, setDefinition, clearDefinition, defaultDefinition } = useGraphviz();
    const [isCollapsed, setIsCollapsed] = useState(false);

    const togglePanel = () => {
        setIsCollapsed(!isCollapsed);
    };

    return (
        <div className="flex flex-col h-full gap-1">
            <div className="flex-1 min-h-0">
                <GraphvizPreview />
            </div>
            <ResizablePanel 
                defaultHeight={208}
                isCollapsed={isCollapsed}
                onToggle={togglePanel}
            >
                <GraphvizDefinitionCard
                    definition={definition}
                    onChange={setDefinition}
                    onClear={clearDefinition}
                    defaultDefinition={defaultDefinition}
                    isCollapsed={isCollapsed}
                    onToggle={togglePanel}
                />
            </ResizablePanel>
        </div>
    );
}