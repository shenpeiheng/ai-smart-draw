"use client";

import { useState } from "react";
import { usePlantUML } from "@/contexts/plantuml-context";
import { PlantUMLPreview } from "@/components/plantuml-preview";
import { PlantUMLDefinitionCard } from "@/components/plantuml-definition-card";
import { ResizablePanel } from "@/components/resizable-panel";

export function PlantUMLWorkspace() {
    const { definition, clearDefinition, setDefinition } = usePlantUML();
    const [isCollapsed, setIsCollapsed] = useState(false);

    const togglePanel = () => {
        setIsCollapsed(!isCollapsed);
    };

    return (
        <div className="flex flex-col h-full gap-1">
            <div className="flex-1 min-h-0">
                <PlantUMLPreview definition={definition} />
            </div>
            <ResizablePanel 
                defaultHeight={208}
                isCollapsed={isCollapsed}
                onToggle={togglePanel}
            >
                <PlantUMLDefinitionCard
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