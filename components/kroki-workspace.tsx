"use client";

import { useState, useEffect } from "react";
import { useKroki } from "@/contexts/kroki-context";
import { KrokiPreview } from "@/components/kroki-preview";
import { KrokiDefinitionCard } from "@/components/kroki-definition-card";
import { ResizablePanel } from "@/components/resizable-panel";

export function KrokiWorkspace() {
    const { definition, clearDefinition, setDefinition, setDefinitionForType } = useKroki();
    const [diagramType, setDiagramType] = useState<string>("auto");
    const [isCollapsed, setIsCollapsed] = useState(false);

    const togglePanel = () => {
        setIsCollapsed(!isCollapsed);
    };

    // When the diagram type changes, update the definition to match the selected type
    useEffect(() => {
        if (diagramType !== "auto") {
            setDefinitionForType(diagramType);
        }
    }, [diagramType, setDefinitionForType]);

    return (
        <div className="flex flex-col h-full gap-1">
            <div className="flex-1 min-h-0">
                <KrokiPreview 
                    definition={definition} 
                    diagramType={diagramType}
                    onDiagramTypeChange={setDiagramType}
                />
            </div>
            <ResizablePanel 
                defaultHeight={208}
                isCollapsed={isCollapsed}
                onToggle={togglePanel}
            >
                <KrokiDefinitionCard
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